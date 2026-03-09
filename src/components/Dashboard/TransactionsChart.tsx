import React, { useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import DateRangeSelector, {
  DateRange,
  getDateFromRange,
} from './DateRangeSelector';
import { DashboardTransactions } from '@/apis/robotReportApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TransactionsChartProps {
  transactions: DashboardTransactions;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
}

const TransactionsChart: React.FC<TransactionsChartProps> = ({
  transactions,
  dateRange,
  onDateRangeChange,
  onRefresh,
}) => {
  const chartData = {
    labels: transactions.labels,
    datasets: [
      {
        label: 'Transactions',
        data: transactions.data,
        fill: true,
        backgroundColor: 'rgba(49, 151, 149, 0.08)',
        borderColor: '#319795',
        borderWidth: 2,
        pointBackgroundColor: '#319795',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        min: 0,
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          font: { size: 11 },
          color: '#718096',
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11 },
          color: '#718096',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `${context.parsed.y} transactions`,
        },
      },
    },
  };

  // Build title from date range
  const now = new Date();
  const fromDate = new Date(getDateFromRange(dateRange));
  const formatTitle = () => {
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }) +
      ' at ' +
      d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    return `Transactions ${fmt(fromDate)} - ${fmt(now)}`;
  };

  return (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="lg"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{ boxShadow: '2xl' }}
    >
      <Flex
        px={6}
        pt={5}
        pb={3}
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap={2}
      >
        <Text fontSize="sm" fontWeight="600" color="gray.600">
          {formatTitle()}
        </Text>
        <DateRangeSelector
          value={dateRange}
          onChange={onDateRangeChange}
          onRefresh={onRefresh}
        />
      </Flex>
      <Box px={6} pb={6} h="300px">
        <Line data={chartData} options={options} />
      </Box>
    </Box>
  );
};

export default TransactionsChart;
