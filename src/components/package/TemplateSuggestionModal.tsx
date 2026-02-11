import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Code,
  Checkbox,
  Box,
  Flex,
  useToast
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import type { SuggestedTemplate } from '@/interfaces/activity-package';

interface TemplateSuggestionModalProps {
  isOpen: boolean;
  suggestions: SuggestedTemplate[];
  onClose: () => void;
  onAccept: (selectedTemplates: SuggestedTemplate[]) => void;
}

const TemplateSuggestionModal: React.FC<TemplateSuggestionModalProps> = ({
  isOpen,
  suggestions,
  onClose,
  onAccept,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const toast = useToast();

  useEffect(() => {
    // Auto-select all suggestions by default
    if (isOpen && suggestions.length > 0) {
      setSelectedIds(new Set(suggestions.map(s => s.keywordName)));
    }
  }, [isOpen, suggestions]);

  const handleToggle = (keywordName: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(keywordName)) {
      newSelected.delete(keywordName);
    } else {
      newSelected.add(keywordName);
    }
    setSelectedIds(newSelected);
  };

  const handleAccept = () => {
    const selected = suggestions.filter(s => selectedIds.has(s.keywordName));
    if (selected.length === 0) {
      toast({
        title: 'No templates selected',
        description: 'Please select at least one template',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    onAccept(selected);
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(suggestions.map(s => s.keywordName)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="3xl"
      scrollBehavior="inside"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <CheckIcon color="green.500" />
            <Text>Suggested Activity Templates ({suggestions.length})</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Text color="gray.500" mb={4}>
            We found {suggestions.length} keywords in your Python library. 
            Select the templates you want to create:
          </Text>

          <VStack spacing={3} align="stretch">
            {suggestions.map((template) => {
              const isSelected = selectedIds.has(template.keywordName);
              return (
                <Box
                  key={template.keywordName}
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                  bg={isSelected ? 'green.50' : 'transparent'}
                  borderColor={isSelected ? 'green.200' : 'gray.200'}
                  cursor="pointer"
                  onClick={() => handleToggle(template.keywordName)}
                  _hover={{ borderColor: 'green.300' }}
                >
                  <Flex alignItems="start">
                    <Checkbox
                      isChecked={isSelected}
                      onChange={() => handleToggle(template.keywordName)}
                      mr={3}
                      mt={1}
                      colorScheme="green"
                    />
                    <Box flex="1">
                      <HStack mb={1} wrap="wrap">
                        <Badge colorScheme="blue">{template.displayName}</Badge>
                        <Text fontSize="xs" color="gray.500">
                          @keyword("<Code fontSize="xs" bg="transparent" p={0}>{template.keywordName}</Code>")
                        </Text>
                      </HStack>
                      
                      {template.description && (
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          {template.description}
                        </Text>
                      )}
                      
                      <VStack align="stretch" spacing={1}>
                        <Text fontSize="xs" color="gray.500">
                          Method: <Code fontSize="xs">{template.pythonMethod}()</Code>
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Inputs: {template.inputSchema.length > 0 ? (
                            template.inputSchema.map((input, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                fontSize="xs" 
                                mr={1} 
                                mb={1}
                                textTransform="none"
                              >
                                {input.label} ({input.type}
                                {input.required ? '*' : ''})
                              </Badge>
                            ))
                          ) : (
                            <Text as="span">None</Text>
                          )}
                        </Text>
                      </VStack>
                    </Box>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button size="sm" onClick={handleSelectAll}>Select All</Button>
            <Button size="sm" onClick={handleDeselectAll}>Deselect All</Button>
            <Box flex="1" />
            <Button onClick={onClose}>Cancel</Button>
            <Button colorScheme="green" onClick={handleAccept}>
              Accept Selected ({selectedIds.size})
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TemplateSuggestionModal;
