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
  descriptionVi?: string;
  value?: any;
  options?: Array<{ value: string; label: string }>;
  overrideType?: any;
  hidden?: boolean;
}

export interface ActivityTemplate {
  templateId: string;
  displayName: string;
  displayNameVi?: string;
  description: string;
  descriptionVi?: string;
  iconCode: string;
  type: string;
  keyword: string;
  arguments?: Record<string, ArgumentProps>;
  return?: {
    displayName: string;
    displayNameVi?: string;
    type: string;
    description: string;
    descriptionVi?: string;
  };
}

export interface ActivityPackage {
  _id: string;
  displayName: string;
  displayNameVi?: string;
  description: string;
  descriptionVi?: string;
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
          displayNameVi: pkg.displayNameVi,
          description: pkg.description || '',
          descriptionVi: pkg.descriptionVi,
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
                  descriptionVi: arg.descriptionVi,
                  value: arg.defaultValue
                };
              });
            }

            return {
              templateId: tpl.id,
              displayName: tpl.name,
              displayNameVi: tpl.nameVi,
              description: tpl.description || '',
              descriptionVi: tpl.descriptionVi,
              iconCode: tpl.iconCode || 'FaCube',
              type: tpl.type || 'activity',
              keyword: tpl.keyword,
              arguments: argsRecord,
              return: tpl.returnValue ? {
                displayName: tpl.returnValue.displayName || 'Result',
                displayNameVi: tpl.returnValue.displayNameVi,
                type: tpl.returnValue.type,
                description: tpl.returnValue.description || '',
                descriptionVi: tpl.returnValue.descriptionVi
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
    return packages.map((pkg) => {
      const pkgDisplayName = currentLocale === 'vi' ? (pkg.displayNameVi || pkg.displayName) : pkg.displayName;
      const pkgDescription = currentLocale === 'vi' ? (pkg.descriptionVi || pkg.description) : pkg.description;

      return {
        ...pkg,
        displayName: t(`packages.${pkg._id}.displayName`, pkgDisplayName),
        description: t(`packages.${pkg._id}.description`, pkgDescription),
        activityTemplates: pkg.activityTemplates.map((template) => {
          const tplDisplayName = currentLocale === 'vi' ? (template.displayNameVi || template.displayName) : template.displayName;
          const tplDescription = currentLocale === 'vi' ? (template.descriptionVi || template.description) : template.description;
          
          const translatedTemplate: ActivityTemplate = {
            ...template,
            displayName: t(
              `templates.${template.templateId}.displayName`,
              tplDisplayName
            ),
            description: t(
              `templates.${template.templateId}.description`,
              tplDescription
            ),
          };

          if (template.arguments) {
            translatedTemplate.arguments = Object.entries(
              template.arguments
            ).reduce(
              (acc, [key, argValue]) => {
                const typedArgValue = argValue as ArgumentProps;
                
                let desc = typedArgValue.description;
                if (currentLocale === 'vi') {
                  desc = typedArgValue.descriptionVi || typedArgValue.description;
                }
                
                acc[key] = {
                  ...typedArgValue,
                  description: t(
                    `argumentDescriptions.${key}`,
                    desc || key
                  ),
                };
                return acc;
              },
              {} as Record<string, ArgumentProps>
            );
          }

          if (template.return) {
            const retDisplayName = currentLocale === 'vi' ? (template.return.displayNameVi || template.return.displayName) : template.return.displayName;
            const retDescription = currentLocale === 'vi' ? (template.return.descriptionVi || template.return.description) : template.return.description;
            
            translatedTemplate.return = {
              ...template.return,
              displayName: t(
                `returns.${template.return.displayName}`,
                retDisplayName
              ),
              description: t(
                `returnDescriptions.${template.return.displayName}`,
                retDescription
              ),
            };
          }

          return translatedTemplate;
        }),
      };
    });
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
