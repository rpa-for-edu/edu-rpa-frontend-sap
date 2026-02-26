import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { SearchIcon, QuestionIcon } from '@chakra-ui/icons';
import TeamLayout from '@/components/Layouts/TeamLayout';
import SidebarContent from '@/components/Sidebar/SidebarContent/SidebarContent';
import ConnectionTable from '@/components/Connection/ConnectionTable';
import { useTeamConnections } from '@/hooks/useTeam';
import { ToolTipExplain } from '@/constants/description';
import { GetServerSideProps } from 'next';
import { getServerSideTranslations } from '@/utils/i18n';
import { useTranslation } from 'next-i18next';

const PROVIDERS = [
  { value: '', label: 'All' },
  { value: 'gmail', label: 'Gmail' },
  { value: 'drive', label: 'Google Drive' },
  { value: 'sheets', label: 'Google Sheets' },
  { value: 'moodle', label: 'Moodle' },
  { value: 'slack', label: 'Slack' },
  { value: 'teams', label: 'Microsoft Teams' },
];

export default function TeamConnectionsPage() {
  const router = useRouter();
  const { workspaceId, teamId } = router.query;
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const { t } = useTranslation('workspace');

  const { data: connections, isLoading, error: connectionsError } = useTeamConnections(
    teamId as string,
    providerFilter || undefined
  );

  const connectionData = connections || [];

  const tableProps = {
    header: [
      t('team.connections.service'),
      t('team.connections.connectionName'),
      t('team.connections.createdAt'),
      t('team.connections.status'),
      t('team.connections.action')
    ],
    data: connectionData,
  };

  // Handle API error (403 Forbidden, etc.)
  if (connectionsError) {
    const errorStatus = (connectionsError as any)?.response?.status;
    const errorMessage = errorStatus === 403 
      ? t('team.connections.accessDenied')
      : (connectionsError as any)?.response?.data?.message || t('team.connections.failedToLoad');
    
    return (
      <TeamLayout>
        <div className="mb-[200px]">
          <SidebarContent>
            <h1 className="pl-[20px] ml-[35px] font-bold text-2xl text-[#319795]">
              {t('team.connections.title')}
            </h1>
            <Box mt={6} mx="auto" maxW="600px">
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>{t('team.connections.errorLoading')}</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Box>
              </Alert>
            </Box>
          </SidebarContent>
        </div>
      </TeamLayout>
    );
  }


  return (
    <TeamLayout>
      <div className="mb-[200px]">
        <SidebarContent>
          <div className="flex flex-start items-center">
            <h1 className="pl-[20px] pr-[10px] ml-[35px] font-bold text-2xl text-[#319795]">
              {t('team.connections.title')}
            </h1>
            <Tooltip
              hasArrow
              label={ToolTipExplain.INTERGRATION_SERVICE}
              bg="gray.300"
              color="black"
            >
              <QuestionIcon color="blue.500" />
            </Tooltip>
          </div>

          <div className="w-90 mx-auto my-[30px]">
            <Alert status="info" borderRadius="md" mb={4}>
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>{t('team.connections.readOnlyTitle')}</AlertTitle>
                <AlertDescription>
                  {t('team.connections.readOnlyDesc')}
                </AlertDescription>
              </Box>
            </Alert>

            <div className="flex justify-between items-center gap-[10px]">
              <InputGroup width="320px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  bg="white"
                  type="text"
                  placeholder={t('team.connections.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>

              <Box>
                <Select
                  width="180px"
                  bg="white"
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                >
                  {PROVIDERS.map((provider) => (
                    <option key={provider.value} value={provider.value}>
                      {provider.value === '' ? t(`team.connections.allProviders`) : provider.label}
                    </option>
                  ))}
                </Select>
              </Box>
            </div>
          </div>

          <div className="w-90 mx-auto">
            <ConnectionTable
              header={tableProps.header}
              data={tableProps.data}
              isLoading={isLoading}
            />
          </div>

          {tableProps.data.length === 0 && !isLoading && (
            <div className="w-90 m-auto flex justify-center items-center mt-10">
              <div className="text-center">
                <div className="text-2xl font-bold">{t('team.connections.noConnectionsHere')}</div>
                <div className="text-gray-500">
                  {t('team.connections.contactAdmin')}
                </div>
              </div>
            </div>
          )}
        </SidebarContent>
      </div>
    </TeamLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await getServerSideTranslations(context, [
        'common',
        'sidebar',
        'navbar',
        'workspace',
        'integration-service',
      ])),
    },
  };
};

