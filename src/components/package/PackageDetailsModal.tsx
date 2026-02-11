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
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  Tag, 
  Text, 
  VStack, 
  HStack, 
  SimpleGrid,
  Box,
  Code,
  Badge,
  Flex,
  Spinner,
  Center,
  IconButton,
  Tooltip,
  useToast
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import activityPackageApi from '@/apis/activityPackageApi';
import type { ActivityPackage, ActivityTemplate } from '@/interfaces/activity-package';

interface PackageDetailsModalProps {
  isOpen: boolean;
  packageData: ActivityPackage;
  onClose: () => void;
}

const PackageDetailsModal: React.FC<PackageDetailsModalProps> = ({
  isOpen,
  packageData: initialPackage,
  onClose,
}) => {
  const [pkg, setPkg] = useState<ActivityPackage>(initialPackage);
  const [templates, setTemplates] = useState<ActivityTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && initialPackage) {
      setPkg(initialPackage);
      loadTemplates();
    }
  }, [isOpen, initialPackage]);

  const loadTemplates = async () => {
    if (!initialPackage?.id) return;
    
    setLoading(true);
    try {
      const data = await activityPackageApi.getTemplates(initialPackage.id);
      setTemplates(data);
    } catch (error: any) {
      console.error('Failed to load templates:', error);
      if (initialPackage.activityTemplates) {
        setTemplates(initialPackage.activityTemplates);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!window.confirm(`Delete template "${templateName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await activityPackageApi.deleteTemplate(pkg.id, templateId);
      toast({
        title: 'Template deleted',
        status: 'success',
        duration: 3000,
      });
      loadTemplates();
    } catch (error: any) {
      toast({
        title: 'Failed to delete template',
        description: error.response?.data?.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="teal.600">
          <HStack alignItems="center">
            <Text>{pkg.displayName}</Text>
            <Badge colorScheme={pkg.isActive ? 'green' : 'gray'}>
              {pkg.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          {/* Package Info */}
          <SimpleGrid columns={2} spacing={4} mb={6}>
            <Box>
              <Text fontWeight="bold" color="gray.500" fontSize="sm">Display Name</Text>
              <Text>{pkg.displayName}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" color="gray.500" fontSize="sm">Library</Text>
              <Text>{pkg.library || 'N/A'}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" color="gray.500" fontSize="sm">Version</Text>
              <Text>{pkg.libraryVersion || pkg.version || 'N/A'}</Text>
            </Box>
            
            {pkg.libraryFileName && (
              <>
                <Box>
                  <Text fontWeight="bold" color="gray.500" fontSize="sm">Library File</Text>
                  <HStack>
                    <Text>{pkg.libraryFileName}</Text>
                    <Badge colorScheme="purple">{pkg.libraryFileType?.toUpperCase()}</Badge>
                  </HStack>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.500" fontSize="sm">Package ID</Text>
                  <Text fontFamily="mono" fontSize="sm">{pkg.id}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.500" fontSize="sm">Templates</Text>
                  <Badge colorScheme="teal">{templates.length} templates</Badge>
                </Box>
              </>
            )}
            
            <Box gridColumn="span 2">
              <Text fontWeight="bold" color="gray.500" fontSize="sm">Description</Text>
              <Text>{pkg.description || 'No description'}</Text>
            </Box>
          </SimpleGrid>

          {/* Templates Tab */}
          <Tabs colorScheme="teal" variant="enclosed">
            <TabList>
              <Tab>Activity Templates ({templates.length})</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                {loading ? (
                  <Center py={8}>
                    <Spinner color="teal.500" />
                  </Center>
                ) : templates.length > 0 ? (
                  <VStack align="stretch" spacing={3}>
                    {templates.map((template) => (
                      <Box 
                        key={template.id} 
                        p={3} 
                        borderWidth="1px" 
                        borderRadius="md"
                        _hover={{ bg: 'gray.50' }}
                      >
                        <Flex justifyContent="space-between" alignItems="start">
                          <Box flex="1">
                            <HStack mb={1} wrap="wrap">
                              <Badge colorScheme="teal">{template.name}</Badge>
                              {template.isAutoGenerated && (
                                <Badge colorScheme="orange" variant="outline" fontSize="xs">
                                  Auto-generated
                                </Badge>
                              )}
                            </HStack>
                            {template.description && (
                              <Text fontSize="sm" color="gray.600" mb={1}>
                                {template.description}
                              </Text>
                            )}
                            <Text fontSize="xs" color="gray.500">
                              Keyword: <Code fontSize="xs">{template.keyword}</Code>
                            </Text>
                            {template.arguments && template.arguments.length > 0 && (
                              <Text fontSize="xs" color="gray.500">
                                Arguments: {template.arguments.map(arg => arg.name).join(', ')}
                              </Text>
                            )}
                          </Box>
                          <HStack>
                            <Tooltip label="Edit Template">
                              <IconButton
                                aria-label="Edit"
                                icon={<EditIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="teal"
                              />
                            </Tooltip>
                            <Tooltip label="Delete Template">
                              <IconButton
                                aria-label="Delete"
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteTemplate(template.id, template.name)}
                              />
                            </Tooltip>
                          </HStack>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500" mb={4}>No templates found</Text>
                    <Text fontSize="sm" color="gray.400">
                      Upload a Python library to auto-generate templates
                    </Text>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="teal" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PackageDetailsModal;
