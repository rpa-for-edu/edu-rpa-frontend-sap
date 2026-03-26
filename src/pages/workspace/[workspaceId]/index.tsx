import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Flex,
  Text,
  Spinner,
  Center,
  Icon,
} from '@chakra-ui/react';
import WorkspaceLayout from '@/components/Layouts/WorkspaceLayout';
import SummaryCard from '@/components/Dashboard/SummaryCard';
import RobotStatusWidget from '@/components/Dashboard/RobotStatusWidget';
import JobsHistoryChart from '@/components/Dashboard/JobsHistoryChart';
import TransactionsChart from '@/components/Dashboard/TransactionsChart';
import TriggerTypeWidget from '@/components/Dashboard/TriggerTypeWidget';
import LoadingIndicator from '@/components/LoadingIndicator/LoadingIndicator';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@/constants/queryKey';
import workspaceApi from '@/apis/workspaceApi';
import { Workspace } from '@/interfaces/workspace';
import {
  DateRange,
  getDateFromRange,
} from '@/components/Dashboard/DateRangeSelector';
import { RiFlowChart } from 'react-icons/ri';
import { FaRobot } from 'react-icons/fa';
import { MdPeople, MdGroups, MdPerson } from 'react-icons/md';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { getServerSideTranslations } from '@/utils/i18n';

const WorkspaceDashboard = () => {
  const router = useRouter();
  const { workspaceId } = router.query;
  const wsId = typeof workspaceId === 'string' ? workspaceId : '';
  const { t } = useTranslation('workspace');
  const [dateRange, setDateRange] = useState<DateRange>('last_30_days');

  // Workspace info
  const { data: workspace, isLoading: workspaceLoading } = useQuery<Workspace>({
    queryKey: ['workspace-detail', wsId],
    queryFn: () => workspaceApi.getWorkspaceById(wsId),
    enabled: !!wsId,
  });

  // Summary counts
  const { data: processCount, isLoading: processLoading } = useQuery({
    queryKey: [QUERY_KEY.WS_DASHBOARD_PROCESS_COUNT, wsId],
    queryFn: () => workspaceApi.getWorkspaceProcessCount(wsId),
    enabled: !!wsId,
  });

  const { data: robotCount, isLoading: robotLoading } = useQuery({
    queryKey: [QUERY_KEY.WS_DASHBOARD_ROBOT_COUNT, wsId],
    queryFn: () => workspaceApi.getWorkspaceRobotCount(wsId),
    enabled: !!wsId,
  });

  // Robot statuses
  const {
    data: robotStatuses,
    isLoading: statusesLoading,
    refetch: refetchStatuses,
  } = useQuery({
    queryKey: [QUERY_KEY.WS_DASHBOARD_ROBOT_STATUSES, wsId],
    queryFn: () => workspaceApi.getWorkspaceDashboardRobotStatuses(wsId),
    enabled: !!wsId,
  });

  // Jobs history
  const {
    data: jobsHistory,
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: [QUERY_KEY.WS_DASHBOARD_JOBS_HISTORY, wsId, dateRange],
    queryFn: () =>
      workspaceApi.getWorkspaceDashboardJobsHistory(
        wsId,
        getDateFromRange(dateRange)
      ),
    enabled: !!wsId,
  });

  // Map date range to granularity for proper time bucketing
  const getGranularity = (range: DateRange): 'minute' | 'hour' | 'day' => {
    switch (range) {
      case 'last_hour':
        return 'minute';
      case 'last_day':
        return 'hour';
      case 'last_week':
      case 'last_30_days':
        return 'day';
      default:
        return 'hour';
    }
  };

  // Transactions timeline
  const {
    data: transactions,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: [QUERY_KEY.WS_DASHBOARD_TRANSACTIONS, wsId, dateRange],
    queryFn: () =>
      workspaceApi.getWorkspaceDashboardTransactions(
        wsId,
        getDateFromRange(dateRange),
        getGranularity(dateRange)
      ),
    enabled: !!wsId,
  });

  const handleRefresh = () => {
    refetchStatuses();
    refetchJobs();
    refetchTransactions();
  };

  if (workspaceLoading || processLoading || robotLoading) {
    return (
      <WorkspaceLayout>
        <Center h="calc(100vh - 80px)">
          <Spinner size="xl" />
        </Center>
      </WorkspaceLayout>
    );
  }

  if (!workspace) {
    return (
      <WorkspaceLayout>
        <Container maxW="container.xl" py={8}>
          <Text>{t('dashboard.workspaceNotFound')}</Text>
        </Container>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      <Container maxW="container.xl" py={4}>
        {/* Page Header */}
        <Flex align="center" mb={2}>
          <Box>
            <Heading
              as="h1"
              size="xl"
              bgGradient="linear(to-r, teal.500, teal.300)"
              bgClip="text"
              fontWeight="800"
            >
              {workspace.name}
            </Heading>
            {workspace.description ? (
              <Text color="gray.500" fontSize="sm" mt={1}>
                {workspace.description}
              </Text>
            ) : (
              <Text color="gray.500" fontSize="sm" mt={1}>
                Workspace Dashboard
              </Text>
            )}
          </Box>
        </Flex>

        {/* Workspace Info */}
        <Box
          bg="white"
          borderRadius="xl"
          boxShadow="lg"
          overflow="hidden"
          mb={2}
          transition="all 0.3s ease"
          _hover={{ boxShadow: '2xl' }}
        >
          <Box bgGradient="linear(to-r, #2D3748, #4A5568)" px={8} py={6}>
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
              gap={{ base: 6, md: 0 }}
            >
              {/* Members */}
              <Flex
                align="center"
                gap={4}
                borderRight={{ base: 'none', md: '1px solid' }}
                borderBottom={{ base: '1px solid', md: 'none' }}
                borderColor="whiteAlpha.200"
                pb={{ base: 4, md: 0 }}
                pr={{ base: 0, md: 6 }}
              >
                <Flex
                  w="48px"
                  h="48px"
                  bg="purple.500"
                  borderRadius="lg"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Icon as={MdPeople} boxSize={6} color="white" />
                </Flex>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="white" lineHeight="1.2">
                    {workspace.members?.length || 0}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="wider">
                    {t('dashboard.totalMembers')}
                  </Text>
                </Box>
              </Flex>

              {/* Teams */}
              <Flex
                align="center"
                gap={4}
                borderRight={{ base: 'none', md: '1px solid' }}
                borderBottom={{ base: '1px solid', md: 'none' }}
                borderColor="whiteAlpha.200"
                pb={{ base: 4, md: 0 }}
                px={{ base: 0, md: 6 }}
              >
                <Flex
                  w="48px"
                  h="48px"
                  bg="orange.500"
                  borderRadius="lg"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Icon as={MdGroups} boxSize={6} color="white" />
                </Flex>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="white" lineHeight="1.2">
                    {workspace.teams?.length || 0}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="wider">
                    {t('teams')}
                  </Text>
                </Box>
              </Flex>

              {/* Owner */}
              <Flex
                align="center"
                gap={4}
                pl={{ base: 0, md: 6 }}
              >
                <Flex
                  w="48px"
                  h="48px"
                  bg="pink.500"
                  borderRadius="lg"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Icon as={MdPerson} boxSize={6} color="white" />
                </Flex>
                <Box overflow="hidden">
                  <Text fontSize="md" fontWeight="bold" color="white" noOfLines={1} lineHeight="1.3">
                    {`Owner: ${workspace.owner?.name}`}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.600" noOfLines={1}>
                    {workspace.owner?.email}
                  </Text>
                </Box>
              </Flex>
            </Grid>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Box mb={4}>
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
            }}
            gap={6}
          >
            <GridItem>
              <SummaryCard
                icon={RiFlowChart}
                label="Processes"
                count={processCount?.count ?? processCount ?? 0}
                gradient="linear(to-br, #319795, #2C7A7B)"
              />
            </GridItem>
            <GridItem>
              <SummaryCard
                icon={FaRobot}
                label="Robots"
                count={robotCount?.count ?? robotCount ?? 0}
                gradient="linear(to-br, #3182CE, #2B6CB0)"
              />
            </GridItem>
          </Grid>
        </Box>

        {/* Robot Status + Trigger Types + Jobs History */}
        <Box mb={8}>
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              xl: 'repeat(3, 1fr)',
            }}
            gap={6}
          >
            <GridItem>
              {statusesLoading ? (
                <LoadingIndicator />
              ) : (
                <RobotStatusWidget
                  statuses={
                    robotStatuses ?? {
                      running: 0,
                      stopped: 0,
                      terminating: 0,
                      idle: 0,
                      robots: [],
                      triggerTypeCounts: {},
                    }
                  }
                />
              )}
            </GridItem>
            <GridItem>
              {statusesLoading ? (
                <LoadingIndicator />
              ) : (
                <TriggerTypeWidget
                  triggerTypeCounts={
                    robotStatuses?.triggerTypeCounts ?? {}
                  }
                />
              )}
            </GridItem>
            <GridItem>
              {jobsLoading ? (
                <LoadingIndicator />
              ) : (
                <JobsHistoryChart
                  jobsHistory={
                    jobsHistory ?? {
                      successful: 0,
                      faulted: 0,
                      stopped: 0,
                      total: 0,
                    }
                  }
                />
              )}
            </GridItem>
          </Grid>
        </Box>

        {/* Transactions Timeline */}
        <Box mb={12}>
          {transactionsLoading ? (
            <LoadingIndicator />
          ) : (
            <TransactionsChart
              transactions={
                transactions ?? {
                  labels: [],
                  data: [],
                  total: 0,
                }
              }
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onRefresh={handleRefresh}
            />
          )}
        </Box>
      </Container>
    </WorkspaceLayout>
  );
};

export default WorkspaceDashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await getServerSideTranslations(context, [
        'common',
        'sidebar',
        'navbar',
        'workspace',
      ])),
    },
  };
};
