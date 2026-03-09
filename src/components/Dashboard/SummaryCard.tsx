import React from 'react';
import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { IconType } from 'react-icons';

interface SummaryCardProps {
  icon: IconType;
  label: string;
  count: number;
  gradient: string;
  iconColor?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  label,
  count,
  gradient,
  iconColor = 'white',
}) => {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="lg"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '2xl',
      }}
      position="relative"
    >
      <Box
        bgGradient={gradient}
        px={6}
        py={5}
      >
        <Flex align="center" justify="space-between">
          <Box>
            <Text
              fontSize="sm"
              fontWeight="600"
              color="whiteAlpha.800"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              {label}
            </Text>
            <Text
              fontSize="3xl"
              fontWeight="bold"
              color="white"
              mt={1}
            >
              {count}
            </Text>
          </Box>
          <Flex
            w="50px"
            h="50px"
            bg="whiteAlpha.300"
            borderRadius="lg"
            align="center"
            justify="center"
          >
            <Icon as={icon} boxSize={6} color={iconColor} />
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default SummaryCard;
