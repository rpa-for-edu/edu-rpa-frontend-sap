import React from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Doughnut } from 'react-chartjs-2';
import { DashboardJobsHistory } from '@/apis/robotReportApi';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface JobsHistoryChartProps {
  jobsHistory: DashboardJobsHistory;
}

const JobsHistoryChart: React.FC<JobsHistoryChartProps> = ({ jobsHistory }) => {
  const { successful, faulted, stopped, total } = jobsHistory;

  const data = {
    labels: [`Successful(${successful})`, `Faulted(${faulted})`, `Stopped(${stopped})`],
    datasets: [
      {
        data: [successful, faulted, stopped],
        backgroundColor: ['#38A169', '#E53E3E', '#ED8936'],
        borderWidth: 2,
        borderColor: '#fff',
        hoverBorderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  // Plugin to draw the total number at the exact center of the doughnut
  const centerTextPlugin = {
    id: 'centerText',
    afterDraw(chart: any) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data || meta.data.length === 0) return;

      // Get the center coordinates from the first arc element
      const arc = meta.data[0];
      const centerX = arc.x;
      const centerY = arc.y;

      ctx.save();
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = '#2D3748';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(total), centerX, centerY);
      ctx.restore();
    },
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        cornerRadius: 8,
      },
    },
  };

  return (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="lg"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{ boxShadow: '2xl' }}
      h="100%"
    >
      <Box px={6} pt={5} pb={2}>
        <Text fontSize="lg" fontWeight="700" color="gray.800">
          Jobs History
        </Text>
      </Box>
      <Flex direction="column" align="center" px={6} pb={6}>
        <Box w="240px" h="240px">
          <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
        </Box>
      </Flex>
    </Box>
  );
};

export default JobsHistoryChart;
