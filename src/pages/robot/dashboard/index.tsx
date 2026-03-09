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
import processApi from '@/apis/processApi';
import robotApi from '@/apis/robotApi';
import robotReportApi from '@/apis/robotReportApi';
import { DateRange, getDateFromRange } from '@/components/Dashboard/DateRangeSelector';
import { RiFlowChart } from 'react-icons/ri';
import { FaRobot } from 'react-icons/fa';
import { GetServerSideProps } from 'next';
import { getServerSideTranslations } from '@/utils/i18n';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('last_30_days');

  // Summary counts
  const { data: processCount, isLoading: processLoading } = useQuery({
    queryKey: [QUERY_KEY.PROCESS_COUNT],
    queryFn: () => processApi.getNumberOfProcess(),
  });

  const { data: robotCount, isLoading: robotLoading } = useQuery({
    queryKey: [QUERY_KEY.ROBOT_COUNT],
    queryFn: () => robotApi.getNumberOfRobot(),
  });

  // Robot statuses
  const {
    data: robotStatuses,
    isLoading: statusesLoading,
    refetch: refetchStatuses,
  } = useQuery({
    queryKey: [QUERY_KEY.DASHBOARD_ROBOT_STATUSES],
    queryFn: () => robotReportApi.getAllRobotStatuses(),
  });

  // Jobs history
  const {
    data: jobsHistory,
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: [QUERY_KEY.DASHBOARD_JOBS_HISTORY, dateRange],
    queryFn: () =>
      robotReportApi.getDashboardJobsHistory(getDateFromRange(dateRange)),
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
    queryKey: [QUERY_KEY.DASHBOARD_TRANSACTIONS, dateRange],
    queryFn: () =>
      robotReportApi.getDashboardTransactions(
        getDateFromRange(dateRange),
        getGranularity(dateRange)
      ),
  });

  const handleRefresh = () => {
    refetchStatuses();
    refetchJobs();
    refetchTransactions();
  };

  if (processLoading || robotLoading) {
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
              bgGradient="linear(to-r, teal.500, teal.300)"
              bgClip="text"
              fontWeight="800"
            >
              Dashboard
            </Heading>
            <Text color="gray.500" fontSize="sm" mt={1}>
              Overview of your RPA environment
            </Text>
          </Box>
        </Flex>

        {/* Summary Cards */}
        <Box px={{ base: 4, md: 8 }} mb={8}>
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
                count={processCount ?? 0}
                gradient="linear(to-br, #319795, #2C7A7B)"
              />
            </GridItem>
            <GridItem>
              <SummaryCard
                icon={FaRobot}
                label="Robots"
                count={robotCount ?? 0}
                gradient="linear(to-br, #3182CE, #2B6CB0)"
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
