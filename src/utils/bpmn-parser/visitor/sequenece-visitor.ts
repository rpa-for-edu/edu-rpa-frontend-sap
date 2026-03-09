import { Variable, VariableType } from '@/types/variable';
import { BpmnParseError, BpmnParseErrorCode } from '../error';
import { BpmnTask } from '../model/bpmn';
import { Properties } from '../model/properties.model';
import {
  BlankBlock,
  Branch,
  IfBranchBlock,
  Sequence,
  SequenceItem,
  ParallelBlock,
  ParallelBranchBlock,
} from './BasicBlock';
import {
  Argument,
  BodyItem,
  For,
  If,
  IfBranch,
  Keyword,
  Lib,
  ProcessVariable,
  Resource,
  Robot,
  Test,
  Parallel,
  ParallelBranch,
} from './robot';
import { AuthorizationProvider } from '@/interfaces/enums/provider.enum';
import _ from 'lodash';
import { LibrabryConfigurations } from '@/constants/activityPackage';
import { getLibrary } from '../../propertyService';
import { ActivityPackage } from '@/hooks/useActivityPackages';

export class SequenceVisitor {
  properties: Map<string, Properties>;
  imports: Set<string>;
  variables: Variable[];
  activityPackages: ActivityPackage[];

  constructor(
    public sequence: Sequence,
    properties: Properties[],
    variables: Variable[],
    activityPackages: ActivityPackage[] = []
  ) {
    this.properties = properties.reduce((map, obj) => {
      map.set(obj.activityID, obj);
      return map;
    }, new Map<string, Properties>());
    this.imports = new Set<string>();
    this.variables = variables;
    this.activityPackages = activityPackages;
  }

  visit(node: SequenceItem, param: any) {
    if (!node) return { sequence: param, joinNodeId: null };
    return node.accept(this, param);
  }

  visitBpmnTask(node: BpmnTask, params: any) {}
  visitSequence(node: Sequence, params: any) {}
  visitBranch(node: Branch, params: any) {}
  visitParallelBlock(node: ParallelBlock, params: any) {}
}

export class ConcreteSequenceVisitor extends SequenceVisitor {
  private credentials: {
    provider?: AuthorizationProvider;
    connectionKey: string;
  }[] = [];

  // Maps a non-init keyword (e.g. "Send Message") → its package's init keyword (e.g. "Init Gmail")
  private keywordToInitKeyword: Map<string, string> = new Map();
  // Set of all init keyword names (e.g. "Init Drive", "Init Gmail", "Init Sheets")
  private initKeywordSet: Set<string> = new Set();
  // Maps init keyword name → credential file path (populated as init tasks are visited)
  private initCredentialPaths: Map<string, string> = new Map();

  private _buildInitMappings() {
    for (const pkg of ActivityPackages) {
      if (!pkg.activityTemplates) continue;
      // Find the connection/init template for this package
      const initTemplate = pkg.activityTemplates.find(
        (t: any) => t.arguments?.Connection && t.keyword
      );
      if (!initTemplate) continue;
      const initKeyword = (initTemplate as any).keyword as string;
      this.initKeywordSet.add(initKeyword);
      // Map all other keywords in this package → this init keyword
      for (const template of pkg.activityTemplates) {
        const tmpl = template as any;
        if (tmpl.keyword && tmpl.keyword !== initKeyword) {
          this.keywordToInitKeyword.set(tmpl.keyword, initKeyword);
        }
      }
    }
  }

  parse() {
    this._buildInitMappings();
    let name = '';
    let body: BodyItem[] = this.visit(this.sequence, []);
    let tests = [new Test('Main', body)];
    let variables: ProcessVariable[] = this.parseVariables();
    let librabries = Array.from(this.imports).map(
      (libName) => new Lib(libName, LibrabryConfigurations[libName])
    );

    // Generate s3Libraries based on imports and available packages
    let s3Libraries: any[] = [];
    if (this.activityPackages) {
      this.imports.forEach((libName) => {
        const pkg = this.activityPackages.find((p) => p.library === libName);
        if (pkg && pkg.libraryS3Url) {
          s3Libraries.push({
            name: pkg.library, // using library name
            s3Path: pkg.libraryS3Url,
          });
        }
      });
    }

    let resource = new Resource(librabries, variables);
    let robot = new Robot(name, tests, resource, s3Libraries);
    return robot;
  }

  getCredentials() {
    return this.credentials;
  }

  parseVariables() {
    return this.variables.map((v) => {
      return new ProcessVariable(v.name, this._handleParseValue(v), v.type);
    });
  }

  private _handleParseDictionary(value: string) {
    if (value.length) return `\${{ ${value} }}`;
    else return value;
    // let escapeValue = JSON.stringify(value);
    // return `\${{ ${escapeValue.slice(1, escapeValue.length-1)} }}`
  }

  private _handleParseValue(variable: Variable) {
    const { name, value, type } = variable;
    let returnedValue = '';
    switch (type) {
      case VariableType.Dictionary:
      case VariableType.DocumentTemplate:
        // Parse to robotframework python inline expression logic
        returnedValue = this._handleParseDictionary(value);
        break;
      case VariableType.List:
        if (value.length) returnedValue = `\${{ ${value} }}`;
        break;
      default:
        returnedValue = value;
    }

    // relace true => True, false => False
    returnedValue = returnedValue
      .replace(/\btrue\b/g, 'True')
      .replace(/\bfalse\b/g, 'False');

    return returnedValue;
  }

  visitBpmnTask(node: BpmnTask, params: any[]) {
    let activityID = node.id;
    let configuration = this.properties.get(activityID);

    console.log(`[SequenceVisitor] Visiting task: ${activityID}`, {
      hasConfiguration: !!configuration,
      keyword: configuration?.keyword,
      activityName: configuration?.properties?.activityName,
    });

    if (!configuration) {
      throw new BpmnParseError(
        BpmnParseErrorCode['Missing Property'],
        activityID
      );
    }

    let property = configuration.properties;
    const keyword = configuration.keyword;

    if (!property)
      throw new BpmnParseError(
        BpmnParseErrorCode['Missing Property'],
        activityID
      );
    if (property.activityPackage === 'Control') {
      throw new BpmnParseError(
        BpmnParseErrorCode['Invalid Property'],
        activityID
      );
    }
    const args = property.arguments;
    const assignVariable = property.return;
    let Lib = property.library;

    if (!Lib && property.activityPackage) {
      // Try to find in dynamic packages first
      if (this.activityPackages) {
        const pkg = this.activityPackages.find(
          (p) =>
            p.displayName === property.activityPackage ||
            p._id === property.activityPackage
        );
        if (pkg && pkg.library) {
          Lib = pkg.library;
        }
      }

      // Fallback to static mapping if not found
      if (!Lib) {
        Lib = getLibrary(property.activityPackage);
      }
    }

    let keywordAssigns = [] as ProcessVariable[];
    let keywordArg = [] as Argument[];
    if (!property.activityName) {
      throw new BpmnParseError('Activity name must be specified', node.id);
    }
    if (args) {
      // parse keywords arguments
      for (let argName of Object.keys(args)) {
        // Ignore empty keywords
        // Which may include special 'Connection' Argument that does not have keywordArg
        let arg = args[argName];

        if (arg.overrideType && arg.value && arg.value.match(/^[^\w]{(.*)}$/)) {
          arg.value = arg.overrideType + arg.value.slice(1);
        }

        if (arg.keywordArg && arg.value) {
          keywordArg.push(new Argument(arg.keywordArg, arg.value));
        } else if (
          argName !== 'Librabry' &&
          arg.keywordArg === null &&
          arg.value
        ) {
          // Ignore Librabry override hidden attributes
          // keywordArg empty ==> pass by value
          keywordArg.push(new Argument('', arg.value));
        }
      }
    }

    if (assignVariable) {
      const assignVarName = assignVariable.replace(/^[^\w]{(.*)}$/, '$1');
      const variableInStorage = this._checkVariableValid(assignVarName);
      keywordAssigns.push(
        new ProcessVariable(
          assignVarName,
          variableInStorage.value,
          variableInStorage.type
        )
      );
    }

    // handle Create Lib
    if (Lib) {
      this.imports.add(Lib);
    }
    if (args.Librabry) {
      const library = args.Librabry?.value;
      if (library) {
        this.imports.add(library);
      }
    }
    if (args.Connection) {
      // Add connectionKey for robot
      const connectionArgs = args.Connection;
      const connectionKey =
        connectionArgs?.value
          .split('/')
          .pop()
          .split('.')
          .slice(0, -1)
          .join('.') ?? '';

      // Determine provider from argument type
      let provider: AuthorizationProvider | undefined;

      // 1. Try to find type from dynamic package definition
      if (this.activityPackages) {
        const pkg = this.activityPackages.find(
          (p) =>
            p.displayName === property.activityPackage ||
            p._id === property.activityPackage
        );

        if (pkg) {
          const template = pkg.activityTemplates.find(
            (t) => t.displayName === property.activityName
          );

          if (
            template &&
            template.arguments &&
            template.arguments['Connection']
          ) {
            const connectionType = template.arguments['Connection'].type;

            // Map connection type to provider
            switch (connectionType) {
              case 'connection.Google Drive':
                provider = AuthorizationProvider.G_DRIVE;
                break;
              case 'connection.Google Sheets':
                provider = AuthorizationProvider.G_SHEETS;
                break;
              case 'connection.Google Classroom':
                provider = AuthorizationProvider.G_CLASSROOM;
                break;
              case 'connection.Google Form':
                provider = AuthorizationProvider.G_FORMS;
                break;
              case 'connection.Gmail':
                provider = AuthorizationProvider.G_GMAIL;
                break;
              case 'connection.SAP Mock':
                provider = AuthorizationProvider.SAP_MOCK;
                break;
              case 'connection.ERPNext':
              case 'connection.ERP Next':
                provider = AuthorizationProvider.ERP_NEXT;
                break;
              case 'connection.Moodle':
                provider = AuthorizationProvider.MOODLE;
                break;
            }
          }
        }
      }

      // 2. Fallback: Try mapping from activity package name (for legacy packages)
      if (!provider) {
        // Existing hardcoded mapping logic if any, or manual map based on package name
        const packageToProvider: Record<string, AuthorizationProvider> = {
          'Google Drive': AuthorizationProvider.G_DRIVE,
          'Google Sheet': AuthorizationProvider.G_SHEETS,
          'Google Classroom': AuthorizationProvider.G_CLASSROOM,
          'Google Form': AuthorizationProvider.G_FORMS,
          Gmail: AuthorizationProvider.G_GMAIL,
          'SAP Mock': AuthorizationProvider.SAP_MOCK,
          ERPNext: AuthorizationProvider.ERP_NEXT,
          'ERP Next': AuthorizationProvider.ERP_NEXT,
          Moodle: AuthorizationProvider.MOODLE,
        };
        provider = packageToProvider[property.activityPackage];
      }

      this.credentials.push({
        connectionKey: connectionKey,
        provider: provider,
      });
    }

    let keywords = [new Keyword(keyword, keywordArg, keywordAssigns)];
    return keywords;
  }

  visitSequence(node: Sequence, params: any[]) {
    let body = [] as BodyItem[];
    for (let item of node.block) {
      body = body.concat(this.visit(item, params));
    }
    return body;
  }

  visitBranch(node: Branch, params: any[]) {
    let ifBranch: IfBranch[] = [];
    for (let branch of node.branches) {
      let branchCode: IfBranch = this.visit(branch, params);
      ifBranch.push(branchCode);
    }

    // For Exclusive and Inclusive Gateways, validate conditions
    // Check branch with empty condition
    let emptyFlow = [];
    ifBranch.forEach((branch, index) => {
      if (_.isEmpty(branch.condition)) {
        emptyFlow.push(node.branches[index].conditionId);
      }
    });

    if (emptyFlow.length >= 2) {
      // If there are 2 empty condition branch then it is missing configuration
      throw new BpmnParseError(
        BpmnParseErrorCode['Missing condition'],
        emptyFlow.join(',')
      );
    }

    for (let i = 0; i < ifBranch.length; i++) {
      let branch = ifBranch[i];
      if (branch.condition.length == 0) {
        branch.type = 'ELSE';
        continue;
      }
      branch.type = 'ELSE IF';
    }

    if (ifBranch[0].type == 'ELSE') {
      ifBranch[1].type = 'IF';
    } else {
      ifBranch[0].type = 'IF';
    }

    return [new If(ifBranch)];
  }

  visitIfBranchBlock(node: IfBranchBlock, params: any[]) {
    let body: BodyItem[] = this.visit(node.sequence, params);
    let flowID = node.conditionId;
    let flowProperty = this.properties.get(flowID)?.properties;

    if (_.isEmpty(flowProperty)) {
      return new IfBranch('IF', '', body);
    }

    const flowArgument = flowProperty.arguments?.['Condition'];
    if (!flowArgument || !flowArgument.value) {
      return new IfBranch('IF', '', body);
    }
    const flowValue = flowArgument.value;

    const oLogicConditionList = JSON.parse(flowValue);
    let conditionList = []; // Get condition from properties

    for (let oCondition of oLogicConditionList) {
      const left = oCondition['left'];
      const right = oCondition['right'];
      let logicalOperator = oCondition['logicalOperator'];
      const conditionOperator = oCondition['operator'];

      if (logicalOperator.length) {
        switch (logicalOperator) {
          case '&&':
            logicalOperator = 'and';
            break;
          case '||':
            logicalOperator = 'or';
            break;
          default:
        }
        conditionList.push(logicalOperator);
      }

      if (_.isEmpty(left) || _.isEmpty(right) || _.isEmpty(conditionOperator)) {
        throw new BpmnParseError(
          BpmnParseErrorCode['Missing Property'],
          node.conditionId
        );
      }

      conditionList.push(`${left} ${conditionOperator} ${right}`);
    }

    return new IfBranch('IF', conditionList.join(' '), body);
  }

  // Parallel Block - all branches execute without conditions
  // Auto-injects Init keywords for packages used in each branch
  visitParallelBlock(node: ParallelBlock, params: any[]) {
    let parallelBranches: ParallelBranch[] = [];
    for (let branch of node.branches) {
      let branchBody: BodyItem[] = this.visit(branch, params);
      parallelBranches.push(new ParallelBranch(branchBody));
    }
    return [new Parallel(parallelBranches)];
  }

  // Parallel Branch Block - simple body without condition
  // Traces packages used in the branch and auto-injects missing Init keywords
  visitParallelBranchBlock(node: ParallelBranchBlock, params: any[]) {
    let body: BodyItem[] = this.visit(node.sequence, params);

    // Collect all keywords in this branch body
    const branchKeywords = this._collectKeywordsFromBody(body);

    // Find init keywords already present in the branch
    const existingInits = new Set(
      branchKeywords.filter((kw) => this.initKeywordSet.has(kw))
    );

    // Find required init keywords for non-init keywords in this branch
    const requiredInits = new Map<string, boolean>(); // initKeyword → needed
    for (const kw of branchKeywords) {
      const initKw = this.keywordToInitKeyword.get(kw);
      if (initKw && !existingInits.has(initKw) && !requiredInits.has(initKw)) {
        requiredInits.set(initKw, true);
      }
    }

    // Auto-inject missing Init keywords at the beginning of the branch
    const injectedInits: BodyItem[] = [];
    Array.from(requiredInits.keys()).forEach((initKeyword) => {
      const credentialPath = this.initCredentialPaths.get(initKeyword);
      if (!credentialPath) {
        throw new BpmnParseError(
          `Missing Init for parallel branch: "${initKeyword}" is required but no Init task with credential was found in the main body. Please add "${initKeyword}" before the Parallel Gateway.`,
          node.flowId
        );
      }
      // Create the init keyword with the same credential path
      const initKwItem = new Keyword(
        initKeyword,
        [new Argument('token_file', credentialPath)],
        []
      );
      injectedInits.push(initKwItem);
    });

    return [...injectedInits, ...body];
  }

  // Recursively collects keyword names from a list of BodyItems
  private _collectKeywordsFromBody(body: BodyItem[]): string[] {
    const keywords: string[] = [];
    for (const item of body) {
      if (item instanceof Keyword) {
        keywords.push(item.name);
      } else if (item instanceof If) {
        for (const branch of item.body) {
          keywords.push(...this._collectKeywordsFromBody(branch.body));
        }
      } else if (item instanceof For) {
        keywords.push(...this._collectKeywordsFromBody(item.body));
      } else if (item instanceof Parallel) {
        for (const branch of item.branches) {
          keywords.push(...this._collectKeywordsFromBody(branch.body));
        }
      }
    }
    return keywords;
  }

  visitBlankBlock(node: BlankBlock, params: any[]) {
    let activityID = node.bpmnId;
    let property = this.properties.get(activityID)?.properties;
    if (_.isEmpty(property) || _.isNil(property.arguments.LoopType)) {
      let body = [] as BodyItem[];
      for (let item of node.block) {
        body = body.concat(this.visit(item, params));
      }
      return body;
    } else {
      if (property.activityPackage !== 'Control') {
        throw new BpmnParseError(
          BpmnParseErrorCode['Invalid Property'],
          activityID
        );
      }
      let args = property.arguments;
      switch (args.LoopType.value) {
        case 'for_each':
          let List = args.List;
          let Item = args.Item;

          let bodyForEach = [] as BodyItem[];
          for (let itemForEach of node.block) {
            bodyForEach = bodyForEach.concat(this.visit(itemForEach, params));
          }

          if (!Item.value || !List.value) {
            throw new BpmnParseError(
              BpmnParseErrorCode['Missing Property'],
              activityID
            );
          }
          let ListName = List.value.match(/{\s*(.*?)\s*}/)[1];
          let ItemName = Item.value.match(/{\s*(.*?)\s*}/)[1];

          let ListInStorage = this._checkVariableValid(ListName);
          let ItemInStorage = this._checkVariableValid(ItemName);

          return new For(
            [
              new ProcessVariable(
                ItemName,
                ItemInStorage.value,
                ItemInStorage.type
              ),
            ],
            'IN',
            [
              new ProcessVariable(
                ListName,
                ListInStorage.value,
                ListInStorage.type
              ),
            ],
            bodyForEach
          );
        case 'for_range':
          let bodyForRange = [] as BodyItem[];
          for (let itemForRange of node.block) {
            bodyForRange = bodyForRange.concat(
              this.visit(itemForRange, params)
            );
          }

          let ItemForRange = args.Item;
          let Start = args.Start;
          let End = args.End;

          if (!ItemForRange.value || !Start.value || !End.value) {
            throw new BpmnParseError(
              BpmnParseErrorCode['Missing Property'],
              activityID
            );
          }

          let ItemNameForRange = ItemForRange.value.match(/{\s*(.*?)\s*}/)[1];
          let ItemInStorageForRange =
            this._checkVariableValid(ItemNameForRange);

          return new For(
            [
              new ProcessVariable(
                ItemNameForRange,
                ItemNameForRange,
                ItemInStorageForRange.type
              ),
            ],
            'IN RANGE',
            [Start.value, End.value],
            bodyForRange
          );
      }
    }
  }

  private _checkVariableValid(varName: string) {
    const variable = this.variables.find((v) => v.name === varName);
    if (!variable) {
      throw new BpmnParseError(
        BpmnParseErrorCode['Variable Not Exist'],
        varName
      );
    }
    return variable;
  }
}
