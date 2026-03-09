import React from 'react';
import { Box, Flex, Text, Badge, Icon } from '@chakra-ui/react';
import { FaPlay, FaClock, FaEnvelope, FaRobot } from 'react-icons/fa';
import { MdSchedule } from 'react-icons/md';
import { IconType } from 'react-icons';

interface TriggerTypeWidgetProps {
  triggerTypeCounts: Record<string, number>;
}

interface TriggerInfo {
  icon: IconType;
  color: string;
  bgColor: string;
  label: string;
}

const triggerTypeMap: Record<string, TriggerInfo> = {
  manual: {
    icon: FaPlay,
    color: 'blue.500',
    bgColor: 'blue.50',
    label: 'Manual',
  },
  schedule: {
    icon: MdSchedule,
    color: 'purple.500',
    bgColor: 'purple.50',
    label: 'Schedule',
  },
};

const getEventTriggerInfo = (type: string): TriggerInfo => {
  // event-gmail, event-drive, etc.
  return {
    icon: FaEnvelope,
    color: 'orange.500',
    bgColor: 'orange.50',
    label: type
      .replace('event-', '')
      .replace(/^\w/, (c) => c.toUpperCase()),
  };
};

const getTriggerInfo = (type: string): TriggerInfo => {
  if (triggerTypeMap[type]) return triggerTypeMap[type];
  if (type.startsWith('event-')) return getEventTriggerInfo(type);
  return {
    icon: FaRobot,
    color: 'gray.500',
    bgColor: 'gray.50',
    label: type.replace(/^\w/, (c) => c.toUpperCase()),
  };
};

const TriggerTypeWidget: React.FC<TriggerTypeWidgetProps> = ({
  triggerTypeCounts,
}) => {
  const entries = Object.entries(triggerTypeCounts).sort(
    ([, a], [, b]) => b - a
  );
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

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
      <Flex px={6} pt={5} pb={2} justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="700" color="gray.800">
          Robots by Trigger
        </Text>
        <Badge
          colorScheme="teal"
          variant="subtle"
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="full"
        >
          {total} total
        </Badge>
      </Flex>

      <Box px={6} pb={5}>
        {entries.length === 0 ? (
          <Text color="gray.400" fontSize="sm" py={4} textAlign="center">
            No robots found
          </Text>
        ) : (
          <Flex direction="column" gap={3} mt={2}>
            {entries.map(([type, count]) => {
              const info = getTriggerInfo(type);
              const pct = total > 0 ? (count / total) * 100 : 0;

              return (
                <Box key={type}>
                  <Flex align="center" justify="space-between" mb={1.5}>
                    <Flex align="center" gap={2}>
                      <Flex
                        w="28px"
                        h="28px"
                        bg={info.bgColor}
                        borderRadius="md"
                        align="center"
                        justify="center"
                      >
                        <Icon as={info.icon} color={info.color} boxSize={3.5} />
                      </Flex>
                      <Text fontSize="sm" fontWeight="600" color="gray.700">
                        {info.label}
                      </Text>
                    </Flex>
                    <Text fontSize="sm" fontWeight="700" color="gray.800">
                      {count}
                    </Text>
                  </Flex>
                  {/* Progress bar */}
                  <Box
                    w="100%"
                    h="6px"
                    bg="gray.100"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      h="100%"
                      w={`${pct}%`}
                      bg={info.color}
                      borderRadius="full"
                      transition="width 0.5s ease"
                    />
                  </Box>
                </Box>
              );
            })}
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default TriggerTypeWidget;
