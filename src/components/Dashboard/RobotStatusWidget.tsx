import React from 'react';
import { Box, Grid, GridItem, Text, Flex, Badge } from '@chakra-ui/react';
import { RobotStatusCounts } from '@/apis/robotReportApi';

interface RobotStatusWidgetProps {
  statuses: RobotStatusCounts;
}

interface StatusItemProps {
  label: string;
  count: number;
  colorScheme: string;
  borderColor: string;
}

const StatusItem: React.FC<StatusItemProps> = ({
  label,
  count,
  colorScheme,
  borderColor,
}) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    py={5}
    px={4}
    transition="all 0.2s ease"
    _hover={{ bg: 'gray.50' }}
  >
    <Badge
      colorScheme={colorScheme}
      variant="outline"
      fontSize="sm"
      px={4}
      py={1.5}
      borderRadius="full"
      borderWidth="2px"
      borderColor={borderColor}
      fontWeight="600"
    >
      {label}
    </Badge>
    <Text
      fontSize="2xl"
      fontWeight="bold"
      color="gray.700"
      mt={3}
    >
      {count}
    </Text>
  </Flex>
);

const RobotStatusWidget: React.FC<RobotStatusWidgetProps> = ({ statuses }) => {
  const statusItems: StatusItemProps[] = [
    {
      label: 'Running',
      count: statuses.running,
      colorScheme: 'green',
      borderColor: 'green.400',
    },
    {
      label: 'Stopped',
      count: statuses.stopped,
      colorScheme: 'red',
      borderColor: 'red.400',
    },
    {
      label: 'Terminating',
      count: statuses.terminating,
      colorScheme: 'orange',
      borderColor: 'orange.400',
    },
    {
      label: 'Idle',
      count: statuses.idle,
      colorScheme: 'gray',
      borderColor: 'gray.400',
    },
  ];

  return (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="lg"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{ boxShadow: '2xl' }}
    >
      <Box px={6} pt={5} pb={2}>
        <Text fontSize="lg" fontWeight="700" color="gray.800">
          Robot Status
        </Text>
      </Box>
      <Grid
        templateColumns="repeat(2, 1fr)"
        borderTop="1px solid"
        borderColor="gray.100"
      >
        {statusItems.map((item, index) => (
          <GridItem
            key={item.label}
            borderRight={index % 2 === 0 ? '1px solid' : 'none'}
            borderBottom={index < 2 ? '1px solid' : 'none'}
            borderColor="gray.100"
          >
            <StatusItem {...item} />
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default RobotStatusWidget;
