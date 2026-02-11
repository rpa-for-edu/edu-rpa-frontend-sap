import { useTranslation } from 'next-i18next';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import activityPackageApi from '@/apis/activityPackageApi';
import { ActivityPackage as ApiPackage } from '@/interfaces/activity-package';

export interface ArgumentProps {
  type: string;
  keywordArg?: string;
  provider?: string;
  description?: string;
  value?: any;
  options?: Array<{ value: string; label: string }>;
  overrideType?: any;
  hidden?: boolean;
}

export interface ActivityTemplate {
  templateId: string;
  displayName: string;
  description: string;
  iconCode: string;
  type: string;
  keyword: string;
  arguments?: Record<string, ArgumentProps>;
  return?: {
    displayName: string;
    type: string;
    description: string;
  };
}

export interface ActivityPackage {
  _id: string;
  displayName: string;
  description: string;
  library?: string;
  libraryS3Url?: string;
  activityTemplates: ActivityTemplate[];
}

export const useActivityPackages = (): ActivityPackage[] => {
  const { t, i18n } = useTranslation('activities');
  const currentLocale = i18n.language;
  const router = useRouter();
  const { teamId } = router.query;
  const [packages, setPackages] = useState<ActivityPackage[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchPackages = async () => {
      try {
        let apiPackages: ApiPackage[] = [];
        
        if (teamId && typeof teamId === 'string') {
          apiPackages = await activityPackageApi.getPackagesByTeam(teamId);
        } else {
          apiPackages = await activityPackageApi.getActivePackages();
        }

        if (!isMounted) return;

        const convertedPackages: ActivityPackage[] = apiPackages.map(pkg => ({
          _id: pkg.id,
          displayName: pkg.displayName,
          description: pkg.description || '',
          library: pkg.library,
          libraryS3Url: pkg.libraryS3Url || undefined,
          activityTemplates: (pkg.activityTemplates || []).map(tpl => {
            const argsRecord: Record<string, ArgumentProps> = {};
            if (tpl.arguments) {
              tpl.arguments.forEach(arg => {
                argsRecord[arg.name] = {
                  type: arg.type,
                  keywordArg: arg.keywordArgument,
                  description: arg.description,
                  value: arg.defaultValue
                };
              });
            }

            return {
              templateId: tpl.id,
              displayName: tpl.name,
              description: tpl.description || '',
              iconCode: tpl.iconCode || 'FaCube',
              type: tpl.type || 'activity',
              keyword: tpl.keyword,
              arguments: argsRecord,
              return: tpl.returnValue ? {
                displayName: tpl.returnValue.displayName || 'Result',
                type: tpl.returnValue.type,
                description: tpl.returnValue.description || ''
              } : undefined
            };
          })
        }));
        
        setPackages(convertedPackages);
      } catch (error) {
        console.error("Failed to fetch activity packages:", error);
        if (isMounted) setPackages([]);
      }
    };

    if (router.isReady) {
      fetchPackages();
    }

    return () => {
      isMounted = false;
    };
  }, [teamId, router.isReady, i18n.language]);

  return useMemo(() => {
    return packages.map((pkg) => ({
      ...pkg,
      displayName: t(`packages.${pkg._id}.displayName`, pkg.displayName),
      description: t(`packages.${pkg._id}.description`, pkg.description),
      activityTemplates: pkg.activityTemplates.map((template) => {
        const translatedTemplate: ActivityTemplate = {
          ...template,
          displayName: t(
            `templates.${template.templateId}.displayName`,
            template.displayName
          ),
          description: t(
            `templates.${template.templateId}.description`,
            template.description
          ),
        };

        if (template.arguments) {
          translatedTemplate.arguments = Object.entries(
            template.arguments
          ).reduce(
            (acc, [key, argValue]) => {
              const typedArgValue = argValue as ArgumentProps;
              acc[key] = {
                ...typedArgValue,
                description: t(
                  `argumentDescriptions.${key}`,
                  typedArgValue.description || key
                ),
              };
              return acc;
            },
            {} as Record<string, ArgumentProps>
          );
        }

        if (template.return) {
          translatedTemplate.return = {
            ...template.return,
            displayName: t(
              `returns.${template.return.displayName}`,
              template.return.displayName
            ),
            description: t(
              `returnDescriptions.${template.return.displayName}`,
              template.return.description
            ),
          };
        }

        return translatedTemplate;
      }),
    }));
  }, [packages, t, currentLocale]);
};

export const useActivityPackage = (
  packageId: string
): ActivityPackage | undefined => {
  const packages = useActivityPackages();
  return useMemo(
    () => packages.find((pkg) => pkg._id === packageId),
    [packages, packageId]
  );
};

export const useActivityTemplate = (
  packageId: string,
  templateId: string
): ActivityTemplate | undefined => {
  const pkg = useActivityPackage(packageId);
  return useMemo(
    () => pkg?.activityTemplates.find((t) => t.templateId === templateId),
    [pkg, templateId]
  );
};

export const useVarTypeTranslation = () => {
  const { t } = useTranslation('activities');

  return (varType: string): string => {
    return t(`varTypes.${varType}`, varType);
  };
};

export default useActivityPackages;
