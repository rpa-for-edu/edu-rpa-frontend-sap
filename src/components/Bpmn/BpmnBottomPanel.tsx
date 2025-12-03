import React, { useState } from 'react';
import {
  Box,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  IconButton,
  Collapse,
  Text,
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import VariablesPanel from './VariablesPanel/VariablesPanel';

interface BpmnBottomPanelProps {
  processID: string;
}

export default function BpmnBottomPanel({ processID }: BpmnBottomPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box
      position="relative"
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
    >
      {/* Tab Header - Always visible */}
      <Flex
        align="center"
        justify="space-between"
        px={4}
        py={2}
        cursor="pointer"
        onClick={() => setIsOpen(!isOpen)}
        _hover={{ bg: 'gray.50' }}
      >
        <Tabs
          index={activeTab}
          onChange={setActiveTab}
          size="sm"
          variant="unstyled"
        >
          <TabList>
            <Tab
              _selected={{
                color: 'teal.600',
                borderBottom: '2px solid',
                borderColor: 'teal.600',
              }}
              fontSize="sm"
              fontWeight="medium"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
            >
              Problems
            </Tab>
            <Tab
              _selected={{
                color: 'teal.600',
                borderBottom: '2px solid',
                borderColor: 'teal.600',
              }}
              fontSize="sm"
              fontWeight="medium"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
            >
              Logs
            </Tab>
            <Tab
              _selected={{
                color: 'teal.600',
                borderBottom: '2px solid',
                borderColor: 'teal.600',
              }}
              fontSize="sm"
              fontWeight="medium"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
            >
              Variables
            </Tab>
            <Tab
              _selected={{
                color: 'teal.600',
                borderBottom: '2px solid',
                borderColor: 'teal.600',
              }}
              fontSize="sm"
              fontWeight="medium"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
            >
              Connections
            </Tab>
          </TabList>
        </Tabs>

        <IconButton
          aria-label={isOpen ? 'Collapse panel' : 'Expand panel'}
          icon={isOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
          size="sm"
          variant="ghost"
        />
      </Flex>

      {/* Panel Content */}
      <Collapse in={isOpen} animateOpacity>
        <Box
          height="300px"
          overflowY="auto"
          borderTop="1px solid"
          borderColor="gray.200"
        >
          <Tabs index={activeTab} isLazy>
            <TabPanels>
              {/* Problems Tab */}
              <TabPanel>
                <Box p={4}>
                  <Text color="gray.500" fontSize="sm">
                    No problems detected in the BPMN diagram.
                  </Text>
                </Box>
              </TabPanel>

              {/* Logs Tab */}
              <TabPanel>
                <Box p={4}>
                  <Text color="gray.500" fontSize="sm">
                    No logs available. Run the process to see execution logs.
                  </Text>
                </Box>
              </TabPanel>

              {/* Variables Tab */}
              <TabPanel p={0}>
                <VariablesPanel processID={processID} />
              </TabPanel>

              {/* Connections Tab */}
              <TabPanel>
                <Box p={4}>
                  <Text color="gray.500" fontSize="sm">
                    No external connections configured.
                  </Text>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Collapse>
    </Box>
  );
}

