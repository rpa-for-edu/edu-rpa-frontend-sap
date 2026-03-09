import React from 'react';
import { Box, Flex, Select, IconButton, Text } from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';

export type DateRange = 'last_hour' | 'last_day' | 'last_week' | 'last_30_days';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  onRefresh: () => void;
}

const dateRangeLabels: Record<DateRange, string> = {
  last_hour: 'Last hour',
  last_day: 'Last day',
  last_week: 'Last week',
  last_30_days: 'Last 30 days',
};

export const getDateFromRange = (range: DateRange): string => {
  const now = new Date();
  switch (range) {
    case 'last_hour':
      return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    case 'last_day':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case 'last_week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'last_30_days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  }
};

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  onRefresh,
}) => {
  return (
    <Flex align="center" gap={2}>
      <IconButton
        aria-label="Refresh"
        icon={<RepeatIcon />}
        size="sm"
        variant="ghost"
        colorScheme="teal"
        onClick={onRefresh}
        _hover={{ bg: 'teal.50' }}
      />
      <Select
        size="sm"
        w="150px"
        value={value}
        onChange={(e) => onChange(e.target.value as DateRange)}
        borderRadius="md"
        borderColor="gray.300"
        _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal' }}
        fontWeight="500"
        fontSize="sm"
      >
        {Object.entries(dateRangeLabels).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </Select>
    </Flex>
  );
};

export default DateRangeSelector;
