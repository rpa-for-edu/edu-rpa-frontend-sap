"use strict";
/**
 * JSON to BPMN XML Converter
 * Converts a structured JSON object with BPMN nodes and flows into valid BPMN 2.0 XML
 * that can be rendered and edited by bpmn-js modeler.
 *
 * Also generates activities list compatible with the RPA system.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importJsonToModelerWithActivities = exports.importJsonToModeler = exports.convertJsonToBpmn = exports.validateBpmnJson = exports.convertJsonToProcess = exports.generateActivities = exports.jsonToBpmnXml = void 0;
// Shape dimensions for different BPMN element types
var SHAPE_DIMENSIONS = {
    StartEvent: { width: 36, height: 36 },
    EndEvent: { width: 36, height: 36 },
    Task: { width: 100, height: 80 },
    UserTask: { width: 100, height: 80 },
    ServiceTask: { width: 100, height: 80 },
    ManualTask: { width: 100, height: 80 },
    SendTask: { width: 100, height: 80 },
    ReceiveTask: { width: 100, height: 80 },
    ScriptTask: { width: 100, height: 80 },
    BusinessRuleTask: { width: 100, height: 80 },
    ExclusiveGateway: { width: 50, height: 50 },
    ParallelGateway: { width: 50, height: 50 },
    InclusiveGateway: { width: 50, height: 50 },
    SubProcess: { width: 350, height: 200 },
};
var DEFAULT_LAYOUT_OPTIONS = {
    horizontalSpacing: 180,
    verticalSpacing: 120,
    startX: 200,
    startY: 200,
    branchSpacing: 140,
};
/**
 * Improved auto-layout algorithm with better branch handling
 * - Uses Sugiyama-style layer assignment
 * - Handles gateway branching with proper Y-offset
 * - Avoids element overlapping
 */
function calculateLayout(nodes, flows, options) {
    if (options === void 0) { options = {}; }
    var opts = __assign(__assign({}, DEFAULT_LAYOUT_OPTIONS), options);
    var positions = new Map();
    var waypoints = new Map();
    // Build adjacency lists
    var outgoing = new Map();
    var incoming = new Map();
    var inDegree = new Map();
    var outDegree = new Map();
    nodes.forEach(function (node) {
        outgoing.set(node.id, []);
        incoming.set(node.id, []);
        inDegree.set(node.id, 0);
        outDegree.set(node.id, 0);
    });
    flows.forEach(function (flow) {
        var _a, _b;
        (_a = outgoing.get(flow.source)) === null || _a === void 0 ? void 0 : _a.push(flow.target);
        (_b = incoming.get(flow.target)) === null || _b === void 0 ? void 0 : _b.push(flow.source);
        inDegree.set(flow.target, (inDegree.get(flow.target) || 0) + 1);
        outDegree.set(flow.source, (outDegree.get(flow.source) || 0) + 1);
    });
    var nodeById = new Map(nodes.map(function (n) { return [n.id, n]; }));
    // Identify gateways (split/join points)
    var splitGateways = new Set();
    var joinGateways = new Set();
    nodes.forEach(function (node) {
        if (node.type.includes("Gateway")) {
            var out = outDegree.get(node.id) || 0;
            var inp = inDegree.get(node.id) || 0;
            if (out > 1)
                splitGateways.add(node.id);
            if (inp > 1)
                joinGateways.add(node.id);
        }
    });
    // Layer assignment using BFS from start nodes
    var layers = [];
    var nodeLayer = new Map();
    var visited = new Set();
    // Find start nodes (no incoming edges)
    var currentLayer = nodes
        .filter(function (n) { return (inDegree.get(n.id) || 0) === 0; })
        .map(function (n) { return n.id; });
    var layerIndex = 0;
    var _loop_1 = function () {
        layers.push(__spreadArray([], currentLayer, true));
        currentLayer.forEach(function (nodeId) {
            visited.add(nodeId);
            nodeLayer.set(nodeId, layerIndex);
        });
        var nextLayer = [];
        currentLayer.forEach(function (nodeId) {
            var _a;
            (_a = outgoing.get(nodeId)) === null || _a === void 0 ? void 0 : _a.forEach(function (targetId) {
                var _a;
                if (!visited.has(targetId) && !nextLayer.includes(targetId)) {
                    // For non-join nodes, add immediately
                    // For join nodes, wait until all predecessors are visited
                    var isJoin = joinGateways.has(targetId);
                    if (isJoin) {
                        var allPredecessorsVisited = (_a = incoming
                            .get(targetId)) === null || _a === void 0 ? void 0 : _a.every(function (pred) { return visited.has(pred); });
                        if (allPredecessorsVisited) {
                            nextLayer.push(targetId);
                        }
                    }
                    else {
                        nextLayer.push(targetId);
                    }
                }
            });
        });
        currentLayer = nextLayer;
        layerIndex++;
        // Safety check to prevent infinite loops
        if (layerIndex > nodes.length * 2)
            return "break";
    };
    while (currentLayer.length > 0) {
        var state_1 = _loop_1();
        if (state_1 === "break")
            break;
    }
    // Handle remaining nodes (cycles or disconnected)
    nodes.forEach(function (node) {
        if (!visited.has(node.id)) {
            // Try to find best layer based on predecessors
            var preds = incoming.get(node.id) || [];
            var maxPredLayer_1 = -1;
            preds.forEach(function (pred) {
                var predLayer = nodeLayer.get(pred);
                if (predLayer !== undefined && predLayer > maxPredLayer_1) {
                    maxPredLayer_1 = predLayer;
                }
            });
            var targetLayer = maxPredLayer_1 + 1;
            if (!layers[targetLayer]) {
                layers[targetLayer] = [];
            }
            layers[targetLayer].push(node.id);
            nodeLayer.set(node.id, targetLayer);
            visited.add(node.id);
        }
    });
    // Track branch paths for Y-positioning
    // Each node gets a "branch index" based on which path from gateway it's on
    var nodeBranchIndex = new Map();
    // Trace branches from split gateways
    splitGateways.forEach(function (gatewayId) {
        var targets = outgoing.get(gatewayId) || [];
        targets.forEach(function (targetId, branchIdx) {
            // BFS to assign branch index to all nodes in this branch until join
            var queue = [targetId];
            var branchVisited = new Set();
            while (queue.length > 0) {
                var nodeId = queue.shift();
                if (branchVisited.has(nodeId) || joinGateways.has(nodeId))
                    continue;
                branchVisited.add(nodeId);
                // Only set if not already set (first branch wins)
                if (!nodeBranchIndex.has(nodeId)) {
                    nodeBranchIndex.set(nodeId, branchIdx);
                }
                var nextNodes = outgoing.get(nodeId) || [];
                nextNodes.forEach(function (next) {
                    if (!branchVisited.has(next)) {
                        queue.push(next);
                    }
                });
            }
        });
    });
    // Calculate positions with improved Y-spacing
    layers.forEach(function (layer, layerIdx) {
        // Sort nodes in layer by branch index for consistent ordering
        layer.sort(function (a, b) {
            var _a, _b;
            var branchA = (_a = nodeBranchIndex.get(a)) !== null && _a !== void 0 ? _a : 0;
            var branchB = (_b = nodeBranchIndex.get(b)) !== null && _b !== void 0 ? _b : 0;
            return branchA - branchB;
        });
        // Calculate vertical positions
        var layerHeight = layer.length * opts.branchSpacing;
        var startY = opts.startY - layerHeight / 2 + opts.branchSpacing / 2;
        layer.forEach(function (nodeId, nodeIdx) {
            var node = nodeById.get(nodeId);
            if (!node)
                return;
            var x = opts.startX + layerIdx * opts.horizontalSpacing;
            // Use branch index for Y if available, otherwise use layer position
            var branchIdx = nodeBranchIndex.get(nodeId);
            var y;
            if (branchIdx !== undefined && layer.length > 1) {
                // Offset based on branch index
                y = opts.startY + branchIdx * opts.branchSpacing;
            }
            else if (layer.length === 1) {
                // Single node in layer - center it
                y = opts.startY;
            }
            else {
                // Multiple nodes without branch info - spread vertically
                y = startY + nodeIdx * opts.branchSpacing;
            }
            positions.set(nodeId, { x: x, y: y });
        });
    });
    // Ensure join gateways are centered between their incoming branches
    joinGateways.forEach(function (gatewayId) {
        var preds = incoming.get(gatewayId) || [];
        if (preds.length > 1) {
            var minY_1 = Infinity;
            var maxY_1 = -Infinity;
            preds.forEach(function (predId) {
                var predPos = positions.get(predId);
                if (predPos) {
                    minY_1 = Math.min(minY_1, predPos.y);
                    maxY_1 = Math.max(maxY_1, predPos.y);
                }
            });
            var gatewayPos = positions.get(gatewayId);
            if (gatewayPos && minY_1 !== Infinity) {
                gatewayPos.y = (minY_1 + maxY_1) / 2;
            }
        }
    });
    // Calculate waypoints for flows with improved routing
    flows.forEach(function (flow) {
        var sourceNode = nodeById.get(flow.source);
        var targetNode = nodeById.get(flow.target);
        var sourcePos = positions.get(flow.source);
        var targetPos = positions.get(flow.target);
        if (!sourceNode || !targetNode || !sourcePos || !targetPos)
            return;
        var sourceDims = SHAPE_DIMENSIONS[sourceNode.type] || {
            width: 100,
            height: 80,
        };
        var targetDims = SHAPE_DIMENSIONS[targetNode.type] || {
            width: 100,
            height: 80,
        };
        // Calculate connection points
        var startX = sourcePos.x + sourceDims.width;
        var startY = sourcePos.y + sourceDims.height / 2;
        var endX = targetPos.x;
        var endY = targetPos.y + targetDims.height / 2;
        var flowWaypoints = [];
        // Determine if this is a branch flow (from split gateway)
        var isFromSplitGateway = splitGateways.has(flow.source);
        var isToJoinGateway = joinGateways.has(flow.target);
        var needsRouting = Math.abs(endY - startY) > 30 || endX <= startX;
        if (isFromSplitGateway && needsRouting) {
            // Route from gateway: go right first, then vertical, then to target
            var midX = startX + 40;
            flowWaypoints.push({ x: startX, y: startY }, { x: midX, y: startY }, { x: midX, y: endY }, { x: endX, y: endY });
        }
        else if (isToJoinGateway && needsRouting) {
            // Route to join gateway: go horizontal then vertical to gateway
            var midX = endX - 40;
            flowWaypoints.push({ x: startX, y: startY }, { x: midX, y: startY }, { x: midX, y: endY }, { x: endX, y: endY });
        }
        else if (needsRouting) {
            // General case with vertical difference
            var midX = (startX + endX) / 2;
            flowWaypoints.push({ x: startX, y: startY }, { x: midX, y: startY }, { x: midX, y: endY }, { x: endX, y: endY });
        }
        else {
            // Simple straight line
            flowWaypoints.push({ x: startX, y: startY }, { x: endX, y: endY });
        }
        waypoints.set("Flow_".concat(flow.source, "_").concat(flow.target), flowWaypoints);
    });
    return { positions: positions, waypoints: waypoints };
}
/**
 * Extract automatic node IDs from mapping data
 * Handles both array format and object format of mapping
 */
function extractAutomaticNodeIdsFromMapping(mappings) {
    var automaticNodeIds = new Set();
    if (!mappings)
        return automaticNodeIds;
    // Parse mapping - can be array of objects where values are mapping entries
    var entries = Array.isArray(mappings)
        ? mappings.flatMap(function (item) {
            if (typeof item === "object" && item !== null) {
                // Check if item has node_id directly (flat array)
                if (item.node_id !== undefined) {
                    return [item];
                }
                // Otherwise, extract values from nested object
                return Object.values(item);
            }
            return [];
        })
        : Object.values(mappings);
    entries.forEach(function (entry) {
        if (entry &&
            entry.is_automatic === true &&
            typeof entry.node_id === "string") {
            automaticNodeIds.add(entry.node_id);
        }
    });
    return automaticNodeIds;
}
/**
 * Group in_loop nodes within a subprocess into nested subprocesses
 * Simply groups nodes with in_loop=TRUE - no automatic gateway detection
 *
 * Flow redirection logic:
 * - Flows from external nodes TO in_loop nodes → redirect TO subprocess
 * - Flows from in_loop nodes TO external nodes → redirect FROM subprocess
 * - Flows between in_loop nodes → become internal flows of nested subprocess
 */
function groupInLoopNodesIntoNestedSubProcesses(subProcess) {
    var nodes = subProcess.nodes, internalFlows = subProcess.internalFlows;
    // Find nodes with in_loop=true
    var inLoopNodeIds = new Set();
    nodes.forEach(function (node) {
        if (node.in_loop === true) {
            inLoopNodeIds.add(node.id);
        }
    });
    // If no in_loop nodes, return unchanged
    if (inLoopNodeIds.size === 0) {
        return subProcess;
    }
    // Build adjacency map for internal flows
    var flowMap = new Map();
    var reverseFlowMap = new Map();
    internalFlows.forEach(function (flow) {
        if (!flowMap.has(flow.source))
            flowMap.set(flow.source, []);
        flowMap.get(flow.source).push(flow.target);
        if (!reverseFlowMap.has(flow.target))
            reverseFlowMap.set(flow.target, []);
        reverseFlowMap.get(flow.target).push(flow.source);
    });
    var nodeMap = new Map(nodes.map(function (n) { return [n.id, n]; }));
    var visited = new Set();
    var nestedSubProcesses = new Map();
    var nodeToNestedSubProcess = new Map();
    // Find connected components of in_loop nodes
    inLoopNodeIds.forEach(function (startNodeId) {
        if (visited.has(startNodeId))
            return;
        // BFS to find all connected in_loop nodes
        var component = [];
        var componentSet = new Set();
        var queue = [startNodeId];
        while (queue.length > 0) {
            var currentId = queue.shift();
            if (visited.has(currentId) || componentSet.has(currentId))
                continue;
            if (!inLoopNodeIds.has(currentId))
                continue;
            visited.add(currentId);
            componentSet.add(currentId);
            component.push(currentId);
            // Check neighbors in both directions
            var outNeighbors = flowMap.get(currentId) || [];
            var inNeighbors = reverseFlowMap.get(currentId) || [];
            __spreadArray(__spreadArray([], outNeighbors, true), inNeighbors, true).forEach(function (neighborId) {
                if (!visited.has(neighborId) && inLoopNodeIds.has(neighborId)) {
                    queue.push(neighborId);
                }
            });
        }
        // Create nested subprocess for this component
        if (component.length > 0) {
            var componentNodes = component
                .map(function (id) { return nodeMap.get(id); })
                .filter(Boolean);
            var nestedSubProcessId_1 = "SubProcess_loop_".concat(Date.now().toString(36), "_").concat(Math.random().toString(36).substring(2, 7));
            var nestedStartEventId = "".concat(nestedSubProcessId_1, "_Start");
            var nestedEndEventId = "".concat(nestedSubProcessId_1, "_End");
            // Find internal flows within the nested component (between in_loop nodes only)
            var nestedInternalFlows_1 = [];
            internalFlows.forEach(function (flow) {
                if (componentSet.has(flow.source) && componentSet.has(flow.target)) {
                    nestedInternalFlows_1.push(flow);
                }
            });
            // Generate nested subprocess name
            var nestedSubProcessName = componentNodes.length === 1
                ? "Loop: ".concat(componentNodes[0].name || componentNodes[0].id)
                : "Loop: ".concat(componentNodes.map(function (n) { return n.name || n.id; }).join(", "));
            nestedSubProcesses.set(nestedSubProcessId_1, {
                id: nestedSubProcessId_1,
                name: nestedSubProcessName,
                nodes: componentNodes,
                internalFlows: nestedInternalFlows_1,
                startNodeId: nestedStartEventId,
                endNodeId: nestedEndEventId,
            });
            // Track mapping from original nodes to nested subprocess
            component.forEach(function (id) {
                nodeToNestedSubProcess.set(id, nestedSubProcessId_1);
            });
        }
    });
    // If no nested subprocesses were created, return unchanged
    if (nestedSubProcesses.size === 0) {
        return subProcess;
    }
    // Build new nodes list (replace in_loop nodes with nested subprocess nodes)
    var newNodes = [];
    var addedNestedSubProcessIds = new Set();
    nodes.forEach(function (node) {
        if (nodeToNestedSubProcess.has(node.id)) {
            // This node is part of a nested subprocess
            var nestedSubProcessId = nodeToNestedSubProcess.get(node.id);
            if (nestedSubProcessId &&
                !addedNestedSubProcessIds.has(nestedSubProcessId)) {
                // Add the nested subprocess node instead (only once)
                var nestedSubProcess = nestedSubProcesses.get(nestedSubProcessId);
                newNodes.push({
                    id: nestedSubProcessId,
                    type: "SubProcess",
                    name: nestedSubProcess.name,
                    in_loop: true, // Mark as loop subprocess
                });
                addedNestedSubProcessIds.add(nestedSubProcessId);
            }
        }
        else {
            // Keep non-in_loop nodes
            newNodes.push(node);
        }
    });
    // Process flows - redirect flows that cross subprocess boundary
    var newInternalFlows = [];
    var addedFlowKeys = new Set();
    internalFlows.forEach(function (flow) {
        var sourceInLoop = nodeToNestedSubProcess.has(flow.source);
        var targetInLoop = nodeToNestedSubProcess.has(flow.target);
        // Case 1: Both source and target are in_loop nodes (same or different subprocess)
        if (sourceInLoop && targetInLoop) {
            var sourceSubProcess = nodeToNestedSubProcess.get(flow.source);
            var targetSubProcess = nodeToNestedSubProcess.get(flow.target);
            if (sourceSubProcess === targetSubProcess) {
                // Internal flow within same nested subprocess - already captured in nestedInternalFlows
                // Skip adding to parent flows
                return;
            }
            else {
                // Flow between different nested subprocesses - redirect both ends
                var newSource = sourceSubProcess;
                var newTarget = targetSubProcess;
                var newFlowKey = "".concat(newSource, "_").concat(newTarget);
                if (!addedFlowKeys.has(newFlowKey) && newSource !== newTarget) {
                    addedFlowKeys.add(newFlowKey);
                    newInternalFlows.push(__assign(__assign({}, flow), { source: newSource, target: newTarget }));
                }
            }
        }
        // Case 2: Source is in_loop, target is not → flow exits subprocess
        else if (sourceInLoop && !targetInLoop) {
            var newSource = nodeToNestedSubProcess.get(flow.source);
            var newFlowKey = "".concat(newSource, "_").concat(flow.target);
            if (!addedFlowKeys.has(newFlowKey)) {
                addedFlowKeys.add(newFlowKey);
                newInternalFlows.push(__assign(__assign({}, flow), { source: newSource, target: flow.target }));
            }
        }
        // Case 3: Source is not in_loop, target is in_loop → flow enters subprocess
        else if (!sourceInLoop && targetInLoop) {
            var newTarget = nodeToNestedSubProcess.get(flow.target);
            var newFlowKey = "".concat(flow.source, "_").concat(newTarget);
            if (!addedFlowKeys.has(newFlowKey)) {
                addedFlowKeys.add(newFlowKey);
                newInternalFlows.push(__assign(__assign({}, flow), { source: flow.source, target: newTarget }));
            }
        }
        // Case 4: Neither source nor target is in_loop → keep as is
        else {
            var newFlowKey = "".concat(flow.source, "_").concat(flow.target);
            if (!addedFlowKeys.has(newFlowKey)) {
                addedFlowKeys.add(newFlowKey);
                newInternalFlows.push(flow);
            }
        }
    });
    return __assign(__assign({}, subProcess), { nodes: newNodes, internalFlows: newInternalFlows, nestedSubProcesses: nestedSubProcesses, nodeToNestedSubProcess: nodeToNestedSubProcess });
}
/**
 * Groups nodes with is_automatic=true from mapping into subprocesses
 * - Consecutive automatic nodes (connected by sequenceFlow) form one subprocess
 * - Single automatic nodes also form their own subprocess
 * - Each subprocess has auto-generated start/end events
 */
function groupNodesIntoSubProcesses(nodes, flows, mappings) {
    // Extract automatic node IDs from mapping
    var automaticNodeIds = extractAutomaticNodeIdsFromMapping(mappings);
    // If no automatic nodes, return unchanged
    if (automaticNodeIds.size === 0) {
        return { nodes: nodes, flows: flows, subProcesses: new Map() };
    }
    // Build adjacency map
    var flowMap = new Map();
    var reverseFlowMap = new Map();
    flows.forEach(function (flow) {
        if (!flowMap.has(flow.source))
            flowMap.set(flow.source, []);
        flowMap.get(flow.source).push(flow.target);
        if (!reverseFlowMap.has(flow.target))
            reverseFlowMap.set(flow.target, []);
        reverseFlowMap.get(flow.target).push(flow.source);
    });
    var nodeMap = new Map(nodes.map(function (n) { return [n.id, n]; }));
    var visited = new Set();
    var subProcesses = new Map();
    var nodesToRemove = new Set();
    var flowsToRemove = new Set();
    // Track original node IDs for each subprocess (before in_loop grouping modifies nodes)
    var subProcessOriginalNodeIds = new Map();
    // Find connected components of automatic nodes
    automaticNodeIds.forEach(function (startNodeId) {
        if (visited.has(startNodeId))
            return;
        if (!nodeMap.has(startNodeId))
            return; // Node doesn't exist in BPMN
        // BFS to find all connected automatic nodes
        var component = [];
        var componentSet = new Set();
        var queue = [startNodeId];
        while (queue.length > 0) {
            var currentId = queue.shift();
            if (visited.has(currentId) || componentSet.has(currentId))
                continue;
            if (!automaticNodeIds.has(currentId))
                continue;
            if (!nodeMap.has(currentId))
                continue;
            visited.add(currentId);
            componentSet.add(currentId);
            component.push(currentId);
            // Check neighbors in both directions (following sequence flows)
            var outNeighbors = flowMap.get(currentId) || [];
            var inNeighbors = reverseFlowMap.get(currentId) || [];
            __spreadArray(__spreadArray([], outNeighbors, true), inNeighbors, true).forEach(function (neighborId) {
                if (!visited.has(neighborId) &&
                    automaticNodeIds.has(neighborId) &&
                    nodeMap.has(neighborId)) {
                    queue.push(neighborId);
                }
            });
        }
        // Create subprocess for this component (even if single node)
        if (component.length > 0) {
            var componentNodes = component
                .map(function (id) { return nodeMap.get(id); })
                .filter(Boolean);
            var subProcessId = "SubProcess_auto_".concat(Date.now().toString(36), "_").concat(Math.random().toString(36).substring(2, 7));
            var startEventId = "".concat(subProcessId, "_Start");
            var endEventId = "".concat(subProcessId, "_End");
            // Find internal flows (both source and target in component)
            var internalFlows_1 = [];
            flows.forEach(function (flow) {
                if (componentSet.has(flow.source) && componentSet.has(flow.target)) {
                    internalFlows_1.push(flow);
                    flowsToRemove.add("".concat(flow.source, "_").concat(flow.target));
                }
            });
            // Find entry node (node with external incoming flow or no internal incoming)
            var entryNodeId = component[0];
            for (var _i = 0, component_1 = component; _i < component_1.length; _i++) {
                var nodeId = component_1[_i];
                var incoming = reverseFlowMap.get(nodeId) || [];
                var hasExternalIncoming = incoming.some(function (src) { return !componentSet.has(src); });
                var hasNoInternalIncoming = !incoming.some(function (src) {
                    return componentSet.has(src);
                });
                if (hasExternalIncoming ||
                    (hasNoInternalIncoming && incoming.length > 0)) {
                    entryNodeId = nodeId;
                    break;
                }
            }
            // Find exit node (node with external outgoing flow or no internal outgoing)
            var exitNodeId = component[component.length - 1];
            for (var _a = 0, component_2 = component; _a < component_2.length; _a++) {
                var nodeId = component_2[_a];
                var outgoing = flowMap.get(nodeId) || [];
                var hasExternalOutgoing = outgoing.some(function (tgt) { return !componentSet.has(tgt); });
                var hasNoInternalOutgoing = !outgoing.some(function (tgt) {
                    return componentSet.has(tgt);
                });
                if (hasExternalOutgoing ||
                    (hasNoInternalOutgoing && outgoing.length > 0)) {
                    exitNodeId = nodeId;
                    break;
                }
            }
            // Generate subprocess name
            var subProcessName = componentNodes.length === 1
                ? "Auto: ".concat(componentNodes[0].name || componentNodes[0].id)
                : "Auto: ".concat(componentNodes.map(function (n) { return n.name || n.id; }).join(", "));
            // Create initial subprocess
            var subProcess = {
                id: subProcessId,
                name: subProcessName,
                nodes: componentNodes,
                internalFlows: internalFlows_1,
                startNodeId: startEventId,
                endNodeId: endEventId,
            };
            // Process in_loop nodes within this subprocess to create nested subprocesses
            subProcess = groupInLoopNodesIntoNestedSubProcesses(subProcess);
            subProcesses.set(subProcessId, subProcess);
            // Mark nodes for removal from main process
            component.forEach(function (id) { return nodesToRemove.add(id); });
            // Track original node IDs for this subprocess (for flow redirection)
            subProcessOriginalNodeIds.set(subProcessId, componentSet);
        }
    });
    // Build new nodes and flows lists
    var newNodes = [];
    var newFlows = [];
    // Add nodes that are not in subprocesses
    nodes.forEach(function (node) {
        if (!nodesToRemove.has(node.id)) {
            newNodes.push(node);
        }
    });
    // Add subprocess nodes
    subProcesses.forEach(function (subProcess) {
        newNodes.push({
            id: subProcess.id,
            type: "SubProcess",
            name: subProcess.name,
        });
    });
    // Update flows - redirect flows that cross subprocess boundary
    var addedFlowKeys = new Set();
    flows.forEach(function (flow) {
        var flowKey = "".concat(flow.source, "_").concat(flow.target);
        // Skip internal subprocess flows (they'll be inside subprocess)
        if (flowsToRemove.has(flowKey))
            return;
        var newSource = flow.source;
        var newTarget = flow.target;
        var sourceSubProcessId = null;
        var targetSubProcessId = null;
        // Check if source/target is in a subprocess using ORIGINAL node IDs
        subProcessOriginalNodeIds.forEach(function (originalNodeIds, subProcessId) {
            if (originalNodeIds.has(flow.source)) {
                sourceSubProcessId = subProcessId;
            }
            if (originalNodeIds.has(flow.target)) {
                targetSubProcessId = subProcessId;
            }
        });
        // Case 1: Both in same subprocess - internal flow (should be in flowsToRemove already)
        if (sourceSubProcessId &&
            targetSubProcessId &&
            sourceSubProcessId === targetSubProcessId) {
            // This is an internal flow, skip it
            return;
        }
        // Case 2: Source in subprocess, target not (or in different subprocess) - flow exits
        if (sourceSubProcessId &&
            (!targetSubProcessId || sourceSubProcessId !== targetSubProcessId)) {
            newSource = sourceSubProcessId;
        }
        // Case 3: Target in subprocess, source not (or in different subprocess) - flow enters
        if (targetSubProcessId &&
            (!sourceSubProcessId || sourceSubProcessId !== targetSubProcessId)) {
            newTarget = targetSubProcessId;
        }
        // Avoid duplicate flows and self-loops
        var newFlowKey = "".concat(newSource, "_").concat(newTarget);
        if (addedFlowKeys.has(newFlowKey) || newSource === newTarget) {
            return;
        }
        addedFlowKeys.add(newFlowKey);
        newFlows.push(__assign(__assign({}, flow), { source: newSource, target: newTarget }));
    });
    return { nodes: newNodes, flows: newFlows, subProcesses: subProcesses };
}
// =============================================================================
// XML GENERATION
// =============================================================================
function escapeXml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
function generateProcessId() {
    return "Process_".concat(Date.now().toString(36));
}
function getBpmnElementName(type) {
    var typeMap = {
        StartEvent: "bpmn:startEvent",
        EndEvent: "bpmn:endEvent",
        Task: "bpmn:task",
        UserTask: "bpmn:userTask",
        ServiceTask: "bpmn:serviceTask",
        ManualTask: "bpmn:manualTask",
        SendTask: "bpmn:sendTask",
        ReceiveTask: "bpmn:receiveTask",
        ScriptTask: "bpmn:scriptTask",
        BusinessRuleTask: "bpmn:businessRuleTask",
        ExclusiveGateway: "bpmn:exclusiveGateway",
        ParallelGateway: "bpmn:parallelGateway",
        InclusiveGateway: "bpmn:inclusiveGateway",
        SubProcess: "bpmn:subProcess",
    };
    return typeMap[type] || "bpmn:task";
}
function generateFlowId(source, target) {
    return "Flow_".concat(source, "_").concat(target);
}
function buildFlowReferences(nodeId, flows) {
    var incoming = [];
    var outgoing = [];
    flows.forEach(function (flow) {
        var flowId = generateFlowId(flow.source, flow.target);
        if (flow.source === nodeId) {
            outgoing.push(flowId);
        }
        if (flow.target === nodeId) {
            incoming.push(flowId);
        }
    });
    return { incoming: incoming, outgoing: outgoing };
}
/**
 * Generate XML for nested subprocess content (in_loop subprocesses)
 */
function generateNestedSubProcessContent(nestedSubProcess, indent) {
    var _a, _b;
    if (indent === void 0) { indent = "          "; }
    var xml = "";
    // Add start event
    var startFlowId = "".concat(nestedSubProcess.startNodeId, "_to_first");
    xml += "".concat(indent, "<bpmn:startEvent id=\"").concat(nestedSubProcess.startNodeId, "\" name=\"Start\">\n");
    xml += "".concat(indent, "  <bpmn:outgoing>").concat(startFlowId, "</bpmn:outgoing>\n");
    xml += "".concat(indent, "</bpmn:startEvent>\n");
    // Find first node (entry point)
    var firstNodeId = (_a = nestedSubProcess.nodes[0]) === null || _a === void 0 ? void 0 : _a.id;
    var _loop_2 = function (node) {
        var hasInternalIncoming = nestedSubProcess.internalFlows.some(function (f) { return f.target === node.id; });
        if (!hasInternalIncoming) {
            firstNodeId = node.id;
            return "break";
        }
    };
    for (var _i = 0, _c = nestedSubProcess.nodes; _i < _c.length; _i++) {
        var node = _c[_i];
        var state_2 = _loop_2(node);
        if (state_2 === "break")
            break;
    }
    // Find last node (exit point)
    var lastNodeId = (_b = nestedSubProcess.nodes[nestedSubProcess.nodes.length - 1]) === null || _b === void 0 ? void 0 : _b.id;
    var _loop_3 = function (node) {
        var hasInternalOutgoing = nestedSubProcess.internalFlows.some(function (f) { return f.source === node.id; });
        if (!hasInternalOutgoing) {
            lastNodeId = node.id;
            return "break";
        }
    };
    for (var _d = 0, _e = nestedSubProcess.nodes; _d < _e.length; _d++) {
        var node = _e[_d];
        var state_3 = _loop_3(node);
        if (state_3 === "break")
            break;
    }
    var endFlowId = "last_to_".concat(nestedSubProcess.endNodeId);
    // Generate nested subprocess nodes
    nestedSubProcess.nodes.forEach(function (node) {
        var elementName = getBpmnElementName(node.type);
        var nameAttr = node.name ? " name=\"".concat(escapeXml(node.name), "\"") : "";
        xml += "".concat(indent, "<").concat(elementName, " id=\"").concat(node.id, "\"").concat(nameAttr, ">\n");
        // Incoming flows
        if (node.id === firstNodeId) {
            xml += "".concat(indent, "  <bpmn:incoming>").concat(startFlowId, "</bpmn:incoming>\n");
        }
        nestedSubProcess.internalFlows.forEach(function (flow) {
            if (flow.target === node.id) {
                var flowId = generateFlowId(flow.source, flow.target);
                xml += "".concat(indent, "  <bpmn:incoming>").concat(flowId, "</bpmn:incoming>\n");
            }
        });
        // Outgoing flows
        if (node.id === lastNodeId) {
            xml += "".concat(indent, "  <bpmn:outgoing>").concat(endFlowId, "</bpmn:outgoing>\n");
        }
        nestedSubProcess.internalFlows.forEach(function (flow) {
            if (flow.source === node.id) {
                var flowId = generateFlowId(flow.source, flow.target);
                xml += "".concat(indent, "  <bpmn:outgoing>").concat(flowId, "</bpmn:outgoing>\n");
            }
        });
        xml += "".concat(indent, "</").concat(elementName, ">\n");
    });
    // Add end event
    xml += "".concat(indent, "<bpmn:endEvent id=\"").concat(nestedSubProcess.endNodeId, "\" name=\"End\">\n");
    xml += "".concat(indent, "  <bpmn:incoming>").concat(endFlowId, "</bpmn:incoming>\n");
    xml += "".concat(indent, "</bpmn:endEvent>\n");
    // Generate internal flows
    xml += "".concat(indent, "<bpmn:sequenceFlow id=\"").concat(startFlowId, "\" sourceRef=\"").concat(nestedSubProcess.startNodeId, "\" targetRef=\"").concat(firstNodeId, "\" />\n");
    nestedSubProcess.internalFlows.forEach(function (flow) {
        var flowId = generateFlowId(flow.source, flow.target);
        var nameAttr = flow.condition
            ? " name=\"".concat(escapeXml(flow.condition), "\"")
            : "";
        xml += "".concat(indent, "<bpmn:sequenceFlow id=\"").concat(flowId, "\" sourceRef=\"").concat(flow.source, "\" targetRef=\"").concat(flow.target, "\"").concat(nameAttr);
        if (flow.condition) {
            xml += ">\n";
            xml += "".concat(indent, "  <bpmn:conditionExpression xsi:type=\"bpmn:tFormalExpression\">").concat(escapeXml(flow.condition), "</bpmn:conditionExpression>\n");
            xml += "".concat(indent, "</bpmn:sequenceFlow>\n");
        }
        else {
            xml += " />\n";
        }
    });
    xml += "".concat(indent, "<bpmn:sequenceFlow id=\"").concat(endFlowId, "\" sourceRef=\"").concat(lastNodeId, "\" targetRef=\"").concat(nestedSubProcess.endNodeId, "\" />\n");
    return xml;
}
/**
 * Generate XML for subprocess content
 * Supports nested subprocesses for in_loop nodes
 */
function generateSubProcessContent(subProcess, allFlows) {
    var _a, _b;
    var xml = "";
    // Add start event
    var startFlowId = "".concat(subProcess.startNodeId, "_to_first");
    xml += "      <bpmn:startEvent id=\"".concat(subProcess.startNodeId, "\" name=\"Start\">\n");
    xml += "        <bpmn:outgoing>".concat(startFlowId, "</bpmn:outgoing>\n");
    xml += "      </bpmn:startEvent>\n";
    // Find first node (entry point)
    var firstNodeId = (_a = subProcess.nodes[0]) === null || _a === void 0 ? void 0 : _a.id;
    var _loop_4 = function (node) {
        var hasInternalIncoming = subProcess.internalFlows.some(function (f) { return f.target === node.id; });
        if (!hasInternalIncoming) {
            firstNodeId = node.id;
            return "break";
        }
    };
    for (var _i = 0, _c = subProcess.nodes; _i < _c.length; _i++) {
        var node = _c[_i];
        var state_4 = _loop_4(node);
        if (state_4 === "break")
            break;
    }
    // Find last node (exit point)
    var lastNodeId = (_b = subProcess.nodes[subProcess.nodes.length - 1]) === null || _b === void 0 ? void 0 : _b.id;
    var _loop_5 = function (node) {
        var hasInternalOutgoing = subProcess.internalFlows.some(function (f) { return f.source === node.id; });
        if (!hasInternalOutgoing) {
            lastNodeId = node.id;
            return "break";
        }
    };
    for (var _d = 0, _e = subProcess.nodes; _d < _e.length; _d++) {
        var node = _e[_d];
        var state_5 = _loop_5(node);
        if (state_5 === "break")
            break;
    }
    var endFlowId = "last_to_".concat(subProcess.endNodeId);
    // Generate subprocess nodes (including nested subprocesses)
    subProcess.nodes.forEach(function (node) {
        var _a;
        var nameAttr = node.name ? " name=\"".concat(escapeXml(node.name), "\"") : "";
        // Check if this node is a nested subprocess (in_loop)
        var nestedSubProcess = (_a = subProcess.nestedSubProcesses) === null || _a === void 0 ? void 0 : _a.get(node.id);
        if (nestedSubProcess) {
            // Generate nested subprocess with its content
            xml += "      <bpmn:subProcess id=\"".concat(node.id, "\"").concat(nameAttr, ">\n");
            // Incoming flows for nested subprocess
            if (node.id === firstNodeId) {
                xml += "        <bpmn:incoming>".concat(startFlowId, "</bpmn:incoming>\n");
            }
            subProcess.internalFlows.forEach(function (flow) {
                if (flow.target === node.id) {
                    var flowId = generateFlowId(flow.source, flow.target);
                    xml += "        <bpmn:incoming>".concat(flowId, "</bpmn:incoming>\n");
                }
            });
            // Outgoing flows for nested subprocess
            if (node.id === lastNodeId) {
                xml += "        <bpmn:outgoing>".concat(endFlowId, "</bpmn:outgoing>\n");
            }
            subProcess.internalFlows.forEach(function (flow) {
                if (flow.source === node.id) {
                    var flowId = generateFlowId(flow.source, flow.target);
                    xml += "        <bpmn:outgoing>".concat(flowId, "</bpmn:outgoing>\n");
                }
            });
            // Generate nested subprocess internal content
            xml += generateNestedSubProcessContent(nestedSubProcess, "        ");
            xml += "      </bpmn:subProcess>\n";
        }
        else {
            // Regular node
            var elementName = getBpmnElementName(node.type);
            xml += "      <".concat(elementName, " id=\"").concat(node.id, "\"").concat(nameAttr, ">\n");
            // Incoming flows
            if (node.id === firstNodeId) {
                xml += "        <bpmn:incoming>".concat(startFlowId, "</bpmn:incoming>\n");
            }
            subProcess.internalFlows.forEach(function (flow) {
                if (flow.target === node.id) {
                    var flowId = generateFlowId(flow.source, flow.target);
                    xml += "        <bpmn:incoming>".concat(flowId, "</bpmn:incoming>\n");
                }
            });
            // Outgoing flows
            if (node.id === lastNodeId) {
                xml += "        <bpmn:outgoing>".concat(endFlowId, "</bpmn:outgoing>\n");
            }
            subProcess.internalFlows.forEach(function (flow) {
                if (flow.source === node.id) {
                    var flowId = generateFlowId(flow.source, flow.target);
                    xml += "        <bpmn:outgoing>".concat(flowId, "</bpmn:outgoing>\n");
                }
            });
            xml += "      </".concat(elementName, ">\n");
        }
    });
    // Add end event
    xml += "      <bpmn:endEvent id=\"".concat(subProcess.endNodeId, "\" name=\"End\">\n");
    xml += "        <bpmn:incoming>".concat(endFlowId, "</bpmn:incoming>\n");
    xml += "      </bpmn:endEvent>\n";
    // Generate internal flows
    xml += "      <bpmn:sequenceFlow id=\"".concat(startFlowId, "\" sourceRef=\"").concat(subProcess.startNodeId, "\" targetRef=\"").concat(firstNodeId, "\" />\n");
    subProcess.internalFlows.forEach(function (flow) {
        var flowId = generateFlowId(flow.source, flow.target);
        var nameAttr = flow.condition
            ? " name=\"".concat(escapeXml(flow.condition), "\"")
            : "";
        xml += "      <bpmn:sequenceFlow id=\"".concat(flowId, "\" sourceRef=\"").concat(flow.source, "\" targetRef=\"").concat(flow.target, "\"").concat(nameAttr);
        if (flow.condition) {
            xml += ">\n";
            xml += "        <bpmn:conditionExpression xsi:type=\"bpmn:tFormalExpression\">".concat(escapeXml(flow.condition), "</bpmn:conditionExpression>\n");
            xml += "      </bpmn:sequenceFlow>\n";
        }
        else {
            xml += " />\n";
        }
    });
    xml += "      <bpmn:sequenceFlow id=\"".concat(endFlowId, "\" sourceRef=\"").concat(lastNodeId, "\" targetRef=\"").concat(subProcess.endNodeId, "\" />\n");
    return xml;
}
/**
 * Main function to convert JSON to BPMN XML
 */
function jsonToBpmnXml(data, layoutOptions) {
    var bpmn = data.bpmn, mapping = data.mapping;
    var nodes = bpmn.nodes, flows = bpmn.flows;
    // Group nodes with is_automatic=true from mapping into subprocesses
    var processed = groupNodesIntoSubProcesses(nodes, flows, mapping);
    nodes = processed.nodes;
    flows = processed.flows;
    var subProcesses = processed.subProcesses;
    var processId = generateProcessId();
    var definitionsId = "Definitions_".concat(Date.now().toString(36));
    var diagramId = "BPMNDiagram_".concat(Date.now().toString(36));
    var planeId = "BPMNPlane_".concat(Date.now().toString(36));
    // Calculate layout with improved algorithm
    var layout = calculateLayout(nodes, flows, layoutOptions);
    // Build the BPMN XML
    var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<bpmn:definitions xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\" id=\"".concat(definitionsId, "\" targetNamespace=\"http://bpmn.io/schema/bpmn\" exporter=\"bpmn-js (https://demo.bpmn.io)\" exporterVersion=\"17.0.0\">\n");
    xml += "  <bpmn:process id=\"".concat(processId, "\" isExecutable=\"false\">\n");
    // Generate nodes
    nodes.forEach(function (node) {
        var elementName = getBpmnElementName(node.type);
        var _a = buildFlowReferences(node.id, flows), incoming = _a.incoming, outgoing = _a.outgoing;
        var nameAttr = node.name ? " name=\"".concat(escapeXml(node.name), "\"") : "";
        // Check if this is a subprocess
        var subProcess = subProcesses.get(node.id);
        if (subProcess) {
            // Generate subprocess with internal content
            xml += "    <bpmn:subProcess id=\"".concat(node.id, "\"").concat(nameAttr, ">\n");
            incoming.forEach(function (flowId) {
                xml += "      <bpmn:incoming>".concat(flowId, "</bpmn:incoming>\n");
            });
            outgoing.forEach(function (flowId) {
                xml += "      <bpmn:outgoing>".concat(flowId, "</bpmn:outgoing>\n");
            });
            // Generate subprocess content
            xml += generateSubProcessContent(subProcess, bpmn.flows);
            xml += "    </bpmn:subProcess>\n";
        }
        else {
            // Regular node
            xml += "    <".concat(elementName, " id=\"").concat(node.id, "\"").concat(nameAttr, ">\n");
            incoming.forEach(function (flowId) {
                xml += "      <bpmn:incoming>".concat(flowId, "</bpmn:incoming>\n");
            });
            outgoing.forEach(function (flowId) {
                xml += "      <bpmn:outgoing>".concat(flowId, "</bpmn:outgoing>\n");
            });
            xml += "    </".concat(elementName, ">\n");
        }
    });
    // Generate sequence flows
    flows.forEach(function (flow) {
        var flowId = generateFlowId(flow.source, flow.target);
        var nameAttr = flow.condition
            ? " name=\"".concat(escapeXml(flow.condition), "\"")
            : "";
        xml += "    <bpmn:sequenceFlow id=\"".concat(flowId, "\" sourceRef=\"").concat(flow.source, "\" targetRef=\"").concat(flow.target, "\"").concat(nameAttr);
        if (flow.condition) {
            xml += ">\n";
            xml += "      <bpmn:conditionExpression xsi:type=\"bpmn:tFormalExpression\">".concat(escapeXml(flow.condition), "</bpmn:conditionExpression>\n");
            xml += "    </bpmn:sequenceFlow>\n";
        }
        else {
            xml += " />\n";
        }
    });
    xml += "  </bpmn:process>\n";
    // Generate BPMN Diagram
    xml += "  <bpmndi:BPMNDiagram id=\"".concat(diagramId, "\">\n");
    xml += "    <bpmndi:BPMNPlane id=\"".concat(planeId, "\" bpmnElement=\"").concat(processId, "\">\n");
    // Generate shapes
    nodes.forEach(function (node) {
        var pos = layout.positions.get(node.id);
        if (!pos)
            return;
        var dims = SHAPE_DIMENSIONS[node.type] || { width: 100, height: 80 };
        var shapeId = "".concat(node.id, "_di");
        var subProcess = subProcesses.get(node.id);
        var isExpanded = subProcess ? "true" : undefined;
        xml += "      <bpmndi:BPMNShape id=\"".concat(shapeId, "\" bpmnElement=\"").concat(node.id, "\"");
        if (isExpanded) {
            xml += " isExpanded=\"".concat(isExpanded, "\"");
        }
        xml += ">\n";
        xml += "        <dc:Bounds x=\"".concat(pos.x, "\" y=\"").concat(pos.y, "\" width=\"").concat(dims.width, "\" height=\"").concat(dims.height, "\" />\n");
        if (node.name &&
            [
                "ExclusiveGateway",
                "ParallelGateway",
                "InclusiveGateway",
                "StartEvent",
                "EndEvent",
            ].includes(node.type)) {
            xml += "        <bpmndi:BPMNLabel>\n";
            xml += "          <dc:Bounds x=\"".concat(pos.x - 10, "\" y=\"").concat(pos.y + dims.height + 5, "\" width=\"").concat(dims.width + 20, "\" height=\"14\" />\n");
            xml += "        </bpmndi:BPMNLabel>\n";
        }
        xml += "      </bpmndi:BPMNShape>\n";
        // Generate shapes for subprocess internal elements
        if (subProcess) {
            var subProcessPadding = 20;
            var subProcessInternalWidth = dims.width - 2 * subProcessPadding;
            var subProcessInternalHeight = dims.height - 2 * subProcessPadding;
            // Layout subprocess internal nodes vertically
            var internalNodeCount = subProcess.nodes.length + 2; // +2 for start and end
            var verticalSpacing_1 = subProcessInternalHeight / (internalNodeCount + 1);
            // Start event
            var startX = pos.x + subProcessPadding;
            var startY = pos.y + verticalSpacing_1;
            xml += "      <bpmndi:BPMNShape id=\"".concat(subProcess.startNodeId, "_di\" bpmnElement=\"").concat(subProcess.startNodeId, "\">\n");
            xml += "        <dc:Bounds x=\"".concat(startX, "\" y=\"").concat(startY, "\" width=\"36\" height=\"36\" />\n");
            xml += "      </bpmndi:BPMNShape>\n";
            // Internal nodes (including nested subprocesses)
            subProcess.nodes.forEach(function (internalNode, idx) {
                var _a;
                // Check if this is a nested subprocess (in_loop)
                var nestedSubProcess = (_a = subProcess.nestedSubProcesses) === null || _a === void 0 ? void 0 : _a.get(internalNode.id);
                if (nestedSubProcess) {
                    // Nested subprocess shape
                    var nestedDims_1 = { width: 200, height: 150 };
                    var nestedX_1 = pos.x + (dims.width - nestedDims_1.width) / 2;
                    var nestedY_1 = pos.y + verticalSpacing_1 * (idx + 2);
                    xml += "      <bpmndi:BPMNShape id=\"".concat(internalNode.id, "_di\" bpmnElement=\"").concat(internalNode.id, "\" isExpanded=\"true\">\n");
                    xml += "        <dc:Bounds x=\"".concat(nestedX_1, "\" y=\"").concat(nestedY_1, "\" width=\"").concat(nestedDims_1.width, "\" height=\"").concat(nestedDims_1.height, "\" />\n");
                    xml += "      </bpmndi:BPMNShape>\n";
                    // Generate shapes for nested subprocess internal elements
                    var nestedPadding = 15;
                    var nestedInternalNodeCount = nestedSubProcess.nodes.length + 2;
                    var nestedVerticalSpacing_1 = (nestedDims_1.height - 2 * nestedPadding) /
                        (nestedInternalNodeCount + 1);
                    // Nested start event
                    var nestedStartX = nestedX_1 + nestedPadding;
                    var nestedStartY = nestedY_1 + nestedVerticalSpacing_1;
                    xml += "      <bpmndi:BPMNShape id=\"".concat(nestedSubProcess.startNodeId, "_di\" bpmnElement=\"").concat(nestedSubProcess.startNodeId, "\">\n");
                    xml += "        <dc:Bounds x=\"".concat(nestedStartX, "\" y=\"").concat(nestedStartY, "\" width=\"36\" height=\"36\" />\n");
                    xml += "      </bpmndi:BPMNShape>\n";
                    // Nested internal nodes
                    nestedSubProcess.nodes.forEach(function (nestedInternalNode, nestedIdx) {
                        var nestedInternalDims = SHAPE_DIMENSIONS[nestedInternalNode.type] || {
                            width: 80,
                            height: 60,
                        };
                        var nestedInternalX = nestedX_1 + (nestedDims_1.width - nestedInternalDims.width) / 2;
                        var nestedInternalY = nestedY_1 + nestedVerticalSpacing_1 * (nestedIdx + 2);
                        xml += "      <bpmndi:BPMNShape id=\"".concat(nestedInternalNode.id, "_di\" bpmnElement=\"").concat(nestedInternalNode.id, "\">\n");
                        xml += "        <dc:Bounds x=\"".concat(nestedInternalX, "\" y=\"").concat(nestedInternalY, "\" width=\"").concat(nestedInternalDims.width, "\" height=\"").concat(nestedInternalDims.height, "\" />\n");
                        xml += "      </bpmndi:BPMNShape>\n";
                    });
                    // Nested end event
                    var nestedEndX = nestedX_1 + nestedDims_1.width - nestedPadding - 36;
                    var nestedEndY = nestedY_1 + nestedVerticalSpacing_1 * nestedInternalNodeCount;
                    xml += "      <bpmndi:BPMNShape id=\"".concat(nestedSubProcess.endNodeId, "_di\" bpmnElement=\"").concat(nestedSubProcess.endNodeId, "\">\n");
                    xml += "        <dc:Bounds x=\"".concat(nestedEndX, "\" y=\"").concat(nestedEndY, "\" width=\"36\" height=\"36\" />\n");
                    xml += "      </bpmndi:BPMNShape>\n";
                }
                else {
                    // Regular internal node
                    var internalDims = SHAPE_DIMENSIONS[internalNode.type] || {
                        width: 100,
                        height: 80,
                    };
                    var internalX = pos.x + (dims.width - internalDims.width) / 2;
                    var internalY = pos.y + verticalSpacing_1 * (idx + 2);
                    xml += "      <bpmndi:BPMNShape id=\"".concat(internalNode.id, "_di\" bpmnElement=\"").concat(internalNode.id, "\">\n");
                    xml += "        <dc:Bounds x=\"".concat(internalX, "\" y=\"").concat(internalY, "\" width=\"").concat(internalDims.width, "\" height=\"").concat(internalDims.height, "\" />\n");
                    xml += "      </bpmndi:BPMNShape>\n";
                }
            });
            // End event
            var endX = pos.x + dims.width - subProcessPadding - 36;
            var endY = pos.y + verticalSpacing_1 * internalNodeCount;
            xml += "      <bpmndi:BPMNShape id=\"".concat(subProcess.endNodeId, "_di\" bpmnElement=\"").concat(subProcess.endNodeId, "\">\n");
            xml += "        <dc:Bounds x=\"".concat(endX, "\" y=\"").concat(endY, "\" width=\"36\" height=\"36\" />\n");
            xml += "      </bpmndi:BPMNShape>\n";
        }
    });
    // Generate edges
    flows.forEach(function (flow) {
        var flowId = generateFlowId(flow.source, flow.target);
        var points = layout.waypoints.get(flowId) || [];
        var edgeId = "".concat(flowId, "_di");
        xml += "      <bpmndi:BPMNEdge id=\"".concat(edgeId, "\" bpmnElement=\"").concat(flowId, "\">\n");
        points.forEach(function (point) {
            xml += "        <di:waypoint x=\"".concat(Math.round(point.x), "\" y=\"").concat(Math.round(point.y), "\" />\n");
        });
        if (flow.condition) {
            var midX = points.length > 0 ? (points[0].x + points[points.length - 1].x) / 2 : 0;
            var midY = points.length > 0
                ? (points[0].y + points[points.length - 1].y) / 2 - 15
                : 0;
            xml += "        <bpmndi:BPMNLabel>\n";
            xml += "          <dc:Bounds x=\"".concat(Math.round(midX), "\" y=\"").concat(Math.round(midY), "\" width=\"40\" height=\"14\" />\n");
            xml += "        </bpmndi:BPMNLabel>\n";
        }
        xml += "      </bpmndi:BPMNEdge>\n";
    });
    // Generate edges for subprocess internal flows
    subProcesses.forEach(function (subProcess, subProcessId) {
        var _a, _b, _c, _d;
        var subProcessPos = layout.positions.get(subProcessId);
        if (!subProcessPos)
            return;
        var dims = SHAPE_DIMENSIONS["SubProcess"];
        var padding = 20;
        var internalNodeCount = subProcess.nodes.length + 2;
        var verticalSpacing = (dims.height - 2 * padding) / (internalNodeCount + 1);
        // Start to first node
        var startFlowId = "".concat(subProcess.startNodeId, "_to_first");
        var firstNodeId = (_a = subProcess.nodes[0]) === null || _a === void 0 ? void 0 : _a.id;
        var _loop_6 = function (node) {
            var hasInternalIncoming = subProcess.internalFlows.some(function (f) { return f.target === node.id; });
            if (!hasInternalIncoming) {
                firstNodeId = node.id;
                return "break";
            }
        };
        for (var _i = 0, _e = subProcess.nodes; _i < _e.length; _i++) {
            var node = _e[_i];
            var state_6 = _loop_6(node);
            if (state_6 === "break")
                break;
        }
        var startX = subProcessPos.x + padding + 18; // center of start event
        var startY = subProcessPos.y + verticalSpacing + 18;
        var firstNodeDims = SHAPE_DIMENSIONS[((_b = subProcess.nodes.find(function (n) { return n.id === firstNodeId; })) === null || _b === void 0 ? void 0 : _b.type) || "Task"];
        var firstNodeX = subProcessPos.x + (dims.width - firstNodeDims.width) / 2;
        var firstNodeY = subProcessPos.y +
            verticalSpacing *
                (subProcess.nodes.findIndex(function (n) { return n.id === firstNodeId; }) + 2) +
            firstNodeDims.height / 2;
        xml += "      <bpmndi:BPMNEdge id=\"".concat(startFlowId, "_di\" bpmnElement=\"").concat(startFlowId, "\">\n");
        xml += "        <di:waypoint x=\"".concat(Math.round(startX), "\" y=\"").concat(Math.round(startY), "\" />\n");
        xml += "        <di:waypoint x=\"".concat(Math.round(firstNodeX), "\" y=\"").concat(Math.round(firstNodeY), "\" />\n");
        xml += "      </bpmndi:BPMNEdge>\n";
        // Internal flows
        subProcess.internalFlows.forEach(function (flow) {
            var flowId = generateFlowId(flow.source, flow.target);
            var sourceIdx = subProcess.nodes.findIndex(function (n) { return n.id === flow.source; });
            var targetIdx = subProcess.nodes.findIndex(function (n) { return n.id === flow.target; });
            if (sourceIdx >= 0 && targetIdx >= 0) {
                var sourceDims = SHAPE_DIMENSIONS[subProcess.nodes[sourceIdx].type];
                var targetDims = SHAPE_DIMENSIONS[subProcess.nodes[targetIdx].type];
                var sourceX = subProcessPos.x + (dims.width + sourceDims.width) / 2;
                var sourceY = subProcessPos.y +
                    verticalSpacing * (sourceIdx + 2) +
                    sourceDims.height / 2;
                var targetX = subProcessPos.x + (dims.width - targetDims.width) / 2;
                var targetY = subProcessPos.y +
                    verticalSpacing * (targetIdx + 2) +
                    targetDims.height / 2;
                xml += "      <bpmndi:BPMNEdge id=\"".concat(flowId, "_di\" bpmnElement=\"").concat(flowId, "\">\n");
                xml += "        <di:waypoint x=\"".concat(Math.round(sourceX), "\" y=\"").concat(Math.round(sourceY), "\" />\n");
                xml += "        <di:waypoint x=\"".concat(Math.round(targetX), "\" y=\"").concat(Math.round(targetY), "\" />\n");
                xml += "      </bpmndi:BPMNEdge>\n";
            }
        });
        // Last node to end
        var lastNodeId = (_c = subProcess.nodes[subProcess.nodes.length - 1]) === null || _c === void 0 ? void 0 : _c.id;
        var _loop_7 = function (node) {
            var hasInternalOutgoing = subProcess.internalFlows.some(function (f) { return f.source === node.id; });
            if (!hasInternalOutgoing) {
                lastNodeId = node.id;
                return "break";
            }
        };
        for (var _f = 0, _g = subProcess.nodes; _f < _g.length; _f++) {
            var node = _g[_f];
            var state_7 = _loop_7(node);
            if (state_7 === "break")
                break;
        }
        var endFlowId = "last_to_".concat(subProcess.endNodeId);
        var lastNodeIdx = subProcess.nodes.findIndex(function (n) { return n.id === lastNodeId; });
        var lastNodeDims = SHAPE_DIMENSIONS[((_d = subProcess.nodes[lastNodeIdx]) === null || _d === void 0 ? void 0 : _d.type) || "Task"];
        var lastNodeX = subProcessPos.x + (dims.width + lastNodeDims.width) / 2;
        var lastNodeY = subProcessPos.y +
            verticalSpacing * (lastNodeIdx + 2) +
            lastNodeDims.height / 2;
        var endX = subProcessPos.x + dims.width - padding - 18;
        var endY = subProcessPos.y + verticalSpacing * internalNodeCount + 18;
        xml += "      <bpmndi:BPMNEdge id=\"".concat(endFlowId, "_di\" bpmnElement=\"").concat(endFlowId, "\">\n");
        xml += "        <di:waypoint x=\"".concat(Math.round(lastNodeX), "\" y=\"").concat(Math.round(lastNodeY), "\" />\n");
        xml += "        <di:waypoint x=\"".concat(Math.round(endX), "\" y=\"").concat(Math.round(endY), "\" />\n");
        xml += "      </bpmndi:BPMNEdge>\n";
        // Generate edges for nested subprocesses (in_loop)
        if (subProcess.nestedSubProcesses) {
            subProcess.nestedSubProcesses.forEach(function (nestedSubProcess, nestedSubProcessId) {
                var _a, _b, _c, _d;
                // Find the nested subprocess position (from parent node position)
                var nestedNodeIdx = subProcess.nodes.findIndex(function (n) { return n.id === nestedSubProcessId; });
                if (nestedNodeIdx < 0)
                    return;
                var nestedDims = { width: 200, height: 150 };
                var nestedX = subProcessPos.x + (dims.width - nestedDims.width) / 2;
                var nestedY = subProcessPos.y + verticalSpacing * (nestedNodeIdx + 2);
                var nestedPadding = 15;
                var nestedInternalNodeCount = nestedSubProcess.nodes.length + 2;
                var nestedVerticalSpacing = (nestedDims.height - 2 * nestedPadding) /
                    (nestedInternalNodeCount + 1);
                // Start to first node in nested subprocess
                var nestedStartFlowId = "".concat(nestedSubProcess.startNodeId, "_to_first");
                var nestedFirstNodeId = (_a = nestedSubProcess.nodes[0]) === null || _a === void 0 ? void 0 : _a.id;
                var _loop_8 = function (node) {
                    var hasInternalIncoming = nestedSubProcess.internalFlows.some(function (f) { return f.target === node.id; });
                    if (!hasInternalIncoming) {
                        nestedFirstNodeId = node.id;
                        return "break";
                    }
                };
                for (var _i = 0, _e = nestedSubProcess.nodes; _i < _e.length; _i++) {
                    var node = _e[_i];
                    var state_8 = _loop_8(node);
                    if (state_8 === "break")
                        break;
                }
                var nestedStartX = nestedX + nestedPadding + 18;
                var nestedStartY = nestedY + nestedVerticalSpacing + 18;
                var nestedFirstNodeIdx = nestedSubProcess.nodes.findIndex(function (n) { return n.id === nestedFirstNodeId; });
                var nestedFirstNodeDims = SHAPE_DIMENSIONS[((_b = nestedSubProcess.nodes[nestedFirstNodeIdx]) === null || _b === void 0 ? void 0 : _b.type) || "Task"] || { width: 80, height: 60 };
                var nestedFirstNodeX = nestedX + (nestedDims.width - nestedFirstNodeDims.width) / 2;
                var nestedFirstNodeY = nestedY +
                    nestedVerticalSpacing * (nestedFirstNodeIdx + 2) +
                    nestedFirstNodeDims.height / 2;
                xml += "      <bpmndi:BPMNEdge id=\"".concat(nestedStartFlowId, "_di\" bpmnElement=\"").concat(nestedStartFlowId, "\">\n");
                xml += "        <di:waypoint x=\"".concat(Math.round(nestedStartX), "\" y=\"").concat(Math.round(nestedStartY), "\" />\n");
                xml += "        <di:waypoint x=\"".concat(Math.round(nestedFirstNodeX), "\" y=\"").concat(Math.round(nestedFirstNodeY), "\" />\n");
                xml += "      </bpmndi:BPMNEdge>\n";
                // Internal flows within nested subprocess
                nestedSubProcess.internalFlows.forEach(function (flow) {
                    var flowId = generateFlowId(flow.source, flow.target);
                    var sourceIdx = nestedSubProcess.nodes.findIndex(function (n) { return n.id === flow.source; });
                    var targetIdx = nestedSubProcess.nodes.findIndex(function (n) { return n.id === flow.target; });
                    if (sourceIdx >= 0 && targetIdx >= 0) {
                        var sourceDims = SHAPE_DIMENSIONS[nestedSubProcess.nodes[sourceIdx].type] || { width: 80, height: 60 };
                        var targetDims = SHAPE_DIMENSIONS[nestedSubProcess.nodes[targetIdx].type] || { width: 80, height: 60 };
                        var sourceX = nestedX + (nestedDims.width + sourceDims.width) / 2;
                        var sourceY = nestedY +
                            nestedVerticalSpacing * (sourceIdx + 2) +
                            sourceDims.height / 2;
                        var targetX = nestedX + (nestedDims.width - targetDims.width) / 2;
                        var targetY = nestedY +
                            nestedVerticalSpacing * (targetIdx + 2) +
                            targetDims.height / 2;
                        xml += "      <bpmndi:BPMNEdge id=\"".concat(flowId, "_di\" bpmnElement=\"").concat(flowId, "\">\n");
                        xml += "        <di:waypoint x=\"".concat(Math.round(sourceX), "\" y=\"").concat(Math.round(sourceY), "\" />\n");
                        xml += "        <di:waypoint x=\"".concat(Math.round(targetX), "\" y=\"").concat(Math.round(targetY), "\" />\n");
                        xml += "      </bpmndi:BPMNEdge>\n";
                    }
                });
                // Last node to end in nested subprocess
                var nestedLastNodeId = (_c = nestedSubProcess.nodes[nestedSubProcess.nodes.length - 1]) === null || _c === void 0 ? void 0 : _c.id;
                var _loop_9 = function (node) {
                    var hasInternalOutgoing = nestedSubProcess.internalFlows.some(function (f) { return f.source === node.id; });
                    if (!hasInternalOutgoing) {
                        nestedLastNodeId = node.id;
                        return "break";
                    }
                };
                for (var _f = 0, _g = nestedSubProcess.nodes; _f < _g.length; _f++) {
                    var node = _g[_f];
                    var state_9 = _loop_9(node);
                    if (state_9 === "break")
                        break;
                }
                var nestedEndFlowId = "last_to_".concat(nestedSubProcess.endNodeId);
                var nestedLastNodeIdx = nestedSubProcess.nodes.findIndex(function (n) { return n.id === nestedLastNodeId; });
                var nestedLastNodeDims = SHAPE_DIMENSIONS[((_d = nestedSubProcess.nodes[nestedLastNodeIdx]) === null || _d === void 0 ? void 0 : _d.type) || "Task"] || { width: 80, height: 60 };
                var nestedLastNodeX = nestedX + (nestedDims.width + nestedLastNodeDims.width) / 2;
                var nestedLastNodeY = nestedY +
                    nestedVerticalSpacing * (nestedLastNodeIdx + 2) +
                    nestedLastNodeDims.height / 2;
                var nestedEndX = nestedX + nestedDims.width - nestedPadding - 18;
                var nestedEndY = nestedY + nestedVerticalSpacing * nestedInternalNodeCount + 18;
                xml += "      <bpmndi:BPMNEdge id=\"".concat(nestedEndFlowId, "_di\" bpmnElement=\"").concat(nestedEndFlowId, "\">\n");
                xml += "        <di:waypoint x=\"".concat(Math.round(nestedLastNodeX), "\" y=\"").concat(Math.round(nestedLastNodeY), "\" />\n");
                xml += "        <di:waypoint x=\"".concat(Math.round(nestedEndX), "\" y=\"").concat(Math.round(nestedEndY), "\" />\n");
                xml += "      </bpmndi:BPMNEdge>\n";
            });
        }
    });
    xml += "    </bpmndi:BPMNPlane>\n";
    xml += "  </bpmndi:BPMNDiagram>\n";
    xml += "</bpmn:definitions>\n";
    return xml;
}
exports.jsonToBpmnXml = jsonToBpmnXml;
// =============================================================================
// ACTIVITY GENERATION FROM MAPPING
// =============================================================================
/**
 * Generate activities list from BPMN nodes and activity mappings
 * This creates the activities array compatible with the RPA system
 */
function generateActivities(nodes, flows, mappings) {
    var mappingByNodeId = new Map();
    mappings === null || mappings === void 0 ? void 0 : mappings.forEach(function (m) { return mappingByNodeId.set(m.node_id, m); });
    var activities = [];
    // Generate activities for all nodes
    nodes.forEach(function (node) {
        var bpmnType = "bpmn:".concat(node.type
            .charAt(0)
            .toLowerCase()).concat(node.type.slice(1));
        var mapping = mappingByNodeId.get(node.id);
        var activity = {
            activityID: node.id,
            activityName: node.name || "",
            activityType: bpmnType,
            keyword: (mapping === null || mapping === void 0 ? void 0 : mapping.activity_id) || "",
            properties: {},
        };
        // If mapping exists, build properties from it
        if (mapping) {
            activity.properties = buildActivityProperties(node, mapping);
        }
        activities.push(activity);
    });
    // Generate activities for flows (for condition flows)
    flows.forEach(function (flow) {
        if (flow.condition) {
            var flowId = generateFlowId(flow.source, flow.target);
            activities.push({
                activityID: flowId,
                activityName: flow.condition,
                activityType: "bpmn:sequenceFlow",
                properties: {
                    // Condition will be set up later by user
                    arguments: {},
                },
            });
        }
    });
    return activities;
}
exports.generateActivities = generateActivities;
/**
 * Build activity properties from mapping data
 */
function buildActivityProperties(node, mapping) {
    // Parse activity_id to extract package and activity name
    // Format: "package.activity_name" or just "activity_name"
    var activityParts = mapping.activity_id.split(".");
    var hasPackage = activityParts.length > 1;
    var activityPackage = hasPackage ? activityParts[0] : "";
    var activityName = hasPackage
        ? activityParts.slice(1).join(".")
        : mapping.activity_id;
    var properties = {
        activityPackage: activityPackage,
        activityName: activityName,
        serviceName: activityPackage,
        arguments: {},
        assigns: [],
        // Store mapping metadata for reference
        _mapping: {
            confidence: mapping.confidence,
            manual_review: mapping.manual_review,
            candidates: mapping.candidates,
            input_bindings: mapping.input_bindings,
            outputs: mapping.outputs,
        },
    };
    // Convert input_bindings to arguments if available
    if (mapping.input_bindings && typeof mapping.input_bindings === "object") {
        var args_1 = {};
        Object.entries(mapping.input_bindings).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            args_1[key] = {
                type: "string",
                description: "",
                keywordArg: key,
                value: String(value),
                overrideType: null,
            };
        });
        properties.arguments = args_1;
    }
    return properties;
}
/**
 * Complete converter that takes JSON and returns all necessary data for RPA system
 * - XML: BPMN diagram XML for visualization
 * - Activities: List of activities with properties for each node
 * - Variables: Placeholder for variables (to be populated later)
 */
function convertJsonToProcess(data, layoutOptions) {
    // Validate input
    var validation = validateBpmnJson(data);
    if (!validation.valid) {
        return { success: false, errors: validation.errors };
    }
    var typedData = data;
    try {
        // Generate XML
        var xml = jsonToBpmnXml(typedData, layoutOptions);
        // Generate activities from nodes and mappings
        var activities = generateActivities(typedData.bpmn.nodes, typedData.bpmn.flows, typedData.mapping);
        // Initialize empty variables (to be populated by user later)
        var variables = [];
        return {
            success: true,
            xml: xml,
            activities: activities,
            variables: variables,
        };
    }
    catch (error) {
        return {
            success: false,
            errors: ["Conversion failed: ".concat(error.message)],
        };
    }
}
exports.convertJsonToProcess = convertJsonToProcess;
// =============================================================================
// VALIDATION
// =============================================================================
function validateBpmnJson(data) {
    var errors = [];
    if (!data || typeof data !== "object") {
        errors.push("Input must be an object");
        return { valid: false, errors: errors };
    }
    var typedData = data;
    if (!typedData.bpmn || typeof typedData.bpmn !== "object") {
        errors.push('Missing or invalid "bpmn" property');
        return { valid: false, errors: errors };
    }
    var bpmn = typedData.bpmn;
    if (!Array.isArray(bpmn.nodes)) {
        errors.push('Missing or invalid "bpmn.nodes" array');
    }
    if (!Array.isArray(bpmn.flows)) {
        errors.push('Missing or invalid "bpmn.flows" array');
    }
    if (errors.length > 0) {
        return { valid: false, errors: errors };
    }
    // Validate nodes
    var nodeIds = new Set();
    bpmn.nodes.forEach(function (node, index) {
        if (!node.id) {
            errors.push("Node at index ".concat(index, " is missing \"id\""));
        }
        else if (nodeIds.has(node.id)) {
            errors.push("Duplicate node id: ".concat(node.id));
        }
        else {
            nodeIds.add(node.id);
        }
        if (!node.type) {
            errors.push("Node at index ".concat(index, " is missing \"type\""));
        }
    });
    // Validate flows
    bpmn.flows.forEach(function (flow, index) {
        if (!flow.source) {
            errors.push("Flow at index ".concat(index, " is missing \"source\""));
        }
        else if (!nodeIds.has(flow.source)) {
            errors.push("Flow at index ".concat(index, " references non-existent source node: ").concat(flow.source));
        }
        if (!flow.target) {
            errors.push("Flow at index ".concat(index, " is missing \"target\""));
        }
        else if (!nodeIds.has(flow.target)) {
            errors.push("Flow at index ".concat(index, " references non-existent target node: ").concat(flow.target));
        }
    });
    // Check for start and end events
    var hasStartEvent = bpmn.nodes.some(function (n) { return n.type === "StartEvent"; });
    var hasEndEvent = bpmn.nodes.some(function (n) { return n.type === "EndEvent"; });
    if (!hasStartEvent) {
        errors.push("Process must have at least one StartEvent");
    }
    if (!hasEndEvent) {
        errors.push("Process must have at least one EndEvent");
    }
    return { valid: errors.length === 0, errors: errors };
}
exports.validateBpmnJson = validateBpmnJson;
/**
 * Convert JSON to BPMN XML with validation (legacy function)
 */
function convertJsonToBpmn(data) {
    var validation = validateBpmnJson(data);
    if (!validation.valid) {
        return { success: false, errors: validation.errors };
    }
    try {
        var xml = jsonToBpmnXml(data);
        return { success: true, xml: xml };
    }
    catch (error) {
        return {
            success: false,
            errors: ["XML generation failed: ".concat(error.message)],
        };
    }
}
exports.convertJsonToBpmn = convertJsonToBpmn;
// =============================================================================
// INTEGRATION WITH MODELER
// =============================================================================
/**
 * Parse JSON and import directly into bpmn-js modeler
 */
function importJsonToModeler(modeler, data) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_b) {
            result = convertJsonToBpmn(data);
            if (!result.success || !result.xml) {
                throw new Error("Failed to convert JSON to BPMN: ".concat((_a = result.errors) === null || _a === void 0 ? void 0 : _a.join(", ")));
            }
            return [2 /*return*/, modeler.importXML(result.xml)];
        });
    });
}
exports.importJsonToModeler = importJsonToModeler;
/**
 * Full integration: Import JSON to modeler and return all data for RPA system
 */
function importJsonToModelerWithActivities(modeler, data, layoutOptions) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var result, importResult;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    result = convertJsonToProcess(data, layoutOptions);
                    if (!result.success || !result.xml) {
                        throw new Error("Failed to convert JSON to BPMN: ".concat((_a = result.errors) === null || _a === void 0 ? void 0 : _a.join(", ")));
                    }
                    return [4 /*yield*/, modeler.importXML(result.xml)];
                case 1:
                    importResult = _b.sent();
                    return [2 /*return*/, {
                            warnings: importResult.warnings,
                            activities: result.activities || [],
                            variables: result.variables || [],
                        }];
            }
        });
    });
}
exports.importJsonToModelerWithActivities = importJsonToModelerWithActivities;
