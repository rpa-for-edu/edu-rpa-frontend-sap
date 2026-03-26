import React, { useState } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Flex,
  Text,
} from '@chakra-ui/react';
import SidebarContent from '@/components/Sidebar/SidebarContent/SidebarContent';
import SummaryCard from '@/components/Dashboard/SummaryCard';
import RobotStatusWidget from '@/components/Dashboard/RobotStatusWidget';
import JobsHistoryChart from '@/components/Dashboard/JobsHistoryChart';
import TransactionsChart from '@/components/Dashboard/TransactionsChart';
import TriggerTypeWidget from '@/components/Dashboard/TriggerTypeWidget';
import LoadingIndicator from '@/components/LoadingIndicator/LoadingIndicator';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@/constants/queryKey';
import adminApi from '@/apis/adminApi';
import { DateRange, getDateFromRange } from '@/components/Dashboard/DateRangeSelector';
import { RiFlowChart } from 'react-icons/ri';
import { FaRobot } from 'react-icons/fa';
import { MdPeople, MdWorkspaces } from 'react-icons/md';
import { GetServerSideProps } from 'next';
import { getServerSideTranslations } from '@/utils/i18n';

export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('last_30_days');

  // Summary counts (system-wide)
  const { data: processCount, isLoading: processLoading } = useQuery({
    queryKey: [QUERY_KEY.ADMIN_PROCESS_COUNT],
    queryFn: () => adminApi.getAdminProcessCount(),
  });

  const { data: robotCount, isLoading: robotLoading } = useQuery({
    queryKey: [QUERY_KEY.ADMIN_ROBOT_COUNT],
    queryFn: () => adminApi.getAdminRobotCount(),
  });

  const { data: workspaceCount, isLoading: workspaceLoading } = useQuery({
    queryKey: [QUERY_KEY.ADMIN_WORKSPACE_COUNT],
    queryFn: () => adminApi.getAdminWorkspaceCount(),
  });

  const { data: userCount, isLoading: userLoading } = useQuery({
    queryKey: [QUERY_KEY.ADMIN_USER_COUNT],
    queryFn: () => adminApi.getAdminUserCount(),
  });

  // Robot statuses (system-wide)
  const {
    data: robotStatuses,
    isLoading: statusesLoading,
    refetch: refetchStatuses,
  } = useQuery({
    queryKey: [QUERY_KEY.ADMIN_ROBOT_STATUSES],
    queryFn: () => adminApi.getAdminAllRobotStatuses(),
  });

  // Jobs history (system-wide)
  const {
    data: jobsHistory,
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: [QUERY_KEY.ADMIN_JOBS_HISTORY, dateRange],
    queryFn: () =>
      adminApi.getAdminJobsHistory(getDateFromRange(dateRange)),
  });

  // Map date range to granularity
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

  // Transactions timeline (system-wide)
  const {
    data: transactions,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: [QUERY_KEY.ADMIN_TRANSACTIONS, dateRange],
    queryFn: () =>
      adminApi.getAdminTransactions(
        getDateFromRange(dateRange),
        getGranularity(dateRange)
      ),
  });

  const handleRefresh = () => {
    refetchStatuses();
    refetchJobs();
    refetchTransactions();
  };

  if (processLoading || robotLoading || workspaceLoading || userLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="dashboard-container">
      <SidebarContent>
        {/* Page Header */}
        <Flex
          align="center"
          mb={8}
          px={{ base: 4, md: 8 }}
          pt={2}
        >
          <Box>
            <Heading
              as="h1"
              size="xl"
              bgGradient="linear(to-r, purple.500, purple.300)"
              bgClip="text"
              fontWeight="800"
            >
              System Dashboard
            </Heading>
            <Text color="gray.500" fontSize="sm" mt={1}>
              System-wide overview of your RPA environment
            </Text>
          </Box>
        </Flex>

        {/* Summary Cards */}
        <Box px={{ base: 4, md: 8 }} mb={8}>
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              xl: 'repeat(4, 1fr)',
            }}
            gap={6}
          >
            <GridItem>
              <SummaryCard
                icon={RiFlowChart}
                label="Total Processes"
                count={processCount ?? 0}
                gradient="linear(to-br, #319795, #2C7A7B)"
              />
            </GridItem>
            <GridItem>
              <SummaryCard
                icon={FaRobot}
                label="Total Robots"
                count={robotCount ?? 0}
                gradient="linear(to-br, #3182CE, #2B6CB0)"
              />
            </GridItem>
            <GridItem>
              <SummaryCard
                icon={MdWorkspaces}
                label="Workspaces"
                count={workspaceCount ?? 0}
                gradient="linear(to-br, #805AD5, #6B46C1)"
              />
            </GridItem>
            <GridItem>
              <SummaryCard
                icon={MdPeople}
                label="Users"
                count={userCount ?? 0}
                gradient="linear(to-br, #DD6B20, #C05621)"
              />
            </GridItem>
          </Grid>
        </Box>

        {/* Robot Status + Trigger Types + Jobs History */}
        <Box px={{ base: 4, md: 8 }} mb={8}>
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
        <Box px={{ base: 4, md: 8 }} mb={12}>
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
      </SidebarContent>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await getServerSideTranslations(context, [
        'common',
        'sidebar',
        'navbar',
      ])),
    },
  };
};
