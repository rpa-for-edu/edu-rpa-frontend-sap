import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  Flex,
  SimpleGrid,
  useToast,
  Code,
  useDisclosure,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Spinner,
  Center,
  IconButton,
  Switch
} from '@chakra-ui/react';
import { ChevronRightIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import SidebarContent from '@/components/Sidebar/SidebarContent/SidebarContent';
import activityPackageApi from '@/apis/activityPackageApi';
import type { ActivityPackage, ActivityTemplate } from '@/interfaces/activity-package';
import CreatePackageModal from '@/components/package/CreatePackageModal';
import EditTemplateModal from '@/components/package/EditTemplateModal';
import { COLORS } from '@/constants/colors';
import { GetServerSideProps } from 'next';
import { getServerSideTranslations } from '@/utils/i18n';
import { getDisplayText } from '@/utils/languageHelper';
import { useTranslation } from 'next-i18next';

const PackageDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const { i18n } = useTranslation('common');
  
  const [pkg, setPkg] = useState<ActivityPackage | null>(null);
  const [templates, setTemplates] = useState<ActivityTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit Package Modal
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure();
  
  // Edit Template Modal
  const { 
    isOpen: isEditTemplateOpen, 
    onOpen: onEditTemplateOpen, 
    onClose: onEditTemplateClose 
  } = useDisclosure();
  
  const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null);

  useEffect(() => {
    if (id) {
      loadPackageData();
    }
  }, [id]);

  const loadPackageData = async () => {
    setIsLoading(true);
    try {
      const pkgData = await activityPackageApi.getPackageById(id as string);
      setPkg(pkgData);
      
      // Load templates
      try {
        const templatesData = await activityPackageApi.getTemplates(id as string);
        setTemplates(templatesData);
      } catch (err) {
        // Fallback to embedded templates if API fails or returns empty
        setTemplates(pkgData.activityTemplates || []);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to load package details',
        status: 'error',
      });
      router.push('/admin/packages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTemplate = (template: ActivityTemplate) => {
    setSelectedTemplate(template);
    onEditTemplateOpen();
  };

  const handleEditPackageSuccess = () => {
    onEditClose();
    loadPackageData();
  };

  const handleEditTemplateSuccess = () => {
    onEditTemplateClose();
    setSelectedTemplate(null);
    loadPackageData();
  };

  const handleDeleteTemplate = async (template: ActivityTemplate) => {
    if (!window.confirm(`Are you sure you want to delete template "${template.name}"?`)) {
      return;
    }
    
    try {
      if (!pkg) return;
      await activityPackageApi.deleteTemplate(pkg.id, template.id);
      toast({
        title: 'Template deleted',
        status: 'success',
        duration: 2000,
      });
      loadPackageData();
    } catch (error: any) {
      toast({
        title: 'Failed to delete template',
        description: error.response?.data?.message,
        status: 'error',
      });
    }
  };

  const handleToggleStatus = async () => {
    if (!pkg) return;
    try {
      const updated = await activityPackageApi.togglePackageActive(pkg.id);
      setPkg({ ...pkg, isActive: updated.isActive });
      toast({
        title: `Package is now ${updated.isActive ? 'Active' : 'Inactive'}`,
        status: 'success',
        duration: 2000,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to update status',
        description: error.response?.data?.message,
        status: 'error',
      });
    }
  };

  if (isLoading || !pkg) {
    return (
      <SidebarContent>
        <Center h="50vh"><Spinner size="xl" color="teal.500" /></Center>
      </SidebarContent>
    );
  }

  return (
    <SidebarContent>
      <Container maxW="container.xl" py={5}>
        {/* Breadcrumb */}
        <Breadcrumb separator={<ChevronRightIcon color="gray.500" />} mb={6}>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/packages">Packages</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{getDisplayText(pkg, 'displayName', i18n.language)}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Flex justify="space-between" align="start" mb={6}>
          <VStack align="start" spacing={2}>
            <Heading size="lg" color={COLORS.primary}>{getDisplayText(pkg, 'displayName', i18n.language)}</Heading>
             <HStack spacing={4}>
               <Badge colorScheme="purple" fontSize="0.9em">{pkg.id}</Badge>
               <HStack>
                 <Switch 
                   isChecked={pkg.isActive} 
                   onChange={handleToggleStatus} 
                   colorScheme="teal"
                 />
                 <Badge colorScheme={pkg.isActive ? 'green' : 'gray'}>
                   {pkg.isActive ? 'Active' : 'Inactive'}
                 </Badge>
               </HStack>
            </HStack>
          </VStack>
          <Button 
            leftIcon={<EditIcon />} 
            colorScheme="teal" 
            variant="outline"
            onClick={onEditOpen}
          >
            Edit Package
          </Button>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Box p={5} shadow="sm" borderWidth="1px" borderRadius="lg" bg="white">
             <Text fontWeight="bold" mb={2}>Description</Text>
             <Text color="gray.600">{getDisplayText(pkg, 'description', i18n.language) || 'No description provided.'}</Text>
          </Box>
          <Box p={5} shadow="sm" borderWidth="1px" borderRadius="lg" bg="white">
             <Text fontWeight="bold" mb={2}>Library Info</Text>
             <VStack align="start" spacing={1}>
               <Text fontSize="sm">Library: <Code>{pkg.library}</Code></Text>
               <Text fontSize="sm">Version: {pkg.libraryVersion || pkg.version}</Text>
               <Text fontSize="sm">File: {pkg.libraryFileName || 'N/A'}</Text>
             </VStack>
          </Box>
          <Box p={5} shadow="sm" borderWidth="1px" borderRadius="lg" bg="white">
             <Text fontWeight="bold" mb={2}>Stats</Text>
             <Text fontSize="2xl" fontWeight="bold" color="teal.500">{templates.length}</Text>
             <Text color="gray.500">Activity Templates</Text>
          </Box>
        </SimpleGrid>

        <Box bg="white" shadow="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
           <Box p={4} borderBottomWidth="1px" bg="gray.50">
             <Heading size="md">Activity Templates</Heading>
           </Box>
           
           <VStack spacing={0} align="stretch" divider={<Box borderBottomWidth="1px" borderColor="gray.100" />}>
             {templates.map((template) => (
               <Flex key={template.id} p={4} justify="space-between" _hover={{ bg: 'gray.50' }}>
                 <VStack align="start" spacing={1} flex={1}>
                   <HStack>
                     <Text fontWeight="bold">{getDisplayText(template, 'name', i18n.language)}</Text>
                     <Code fontSize="xs">{template.keyword}</Code>
                     {template.isAutoGenerated && (
                       <Badge colorScheme="orange" variant="outline" fontSize="xs">Auto</Badge>
                     )}
                   </HStack>
                   <Text fontSize="sm" color="gray.600">{getDisplayText(template, 'description', i18n.language)}</Text>
                   
                   {template.arguments && template.arguments.length > 0 && (
                     <HStack mt={1} spacing={2} wrap="wrap">
                       {template.arguments.map((arg, idx) => (
                         <Badge key={idx} size="sm" variant="subtle" colorScheme="blue">
                           {arg.name}: {arg.type}
                         </Badge>
                       ))}
                     </HStack>
                   )}
                 </VStack>

                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Edit Template"
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="teal"
                      onClick={() => handleEditTemplate(template)}
                    />
                    <IconButton
                      aria-label="Delete Template"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeleteTemplate(template)}
                    />
                  </HStack>
               </Flex>
             ))}
             {templates.length === 0 && (
               <Box p={8} textAlign="center">
                 <Text color="gray.500">No templates found.</Text>
               </Box>
             )}
           </VStack>
        </Box>

        {/* Edit Package Modal */}
        <CreatePackageModal
          isOpen={isEditOpen}
          onClose={() => {
            onEditClose();
            // setEditingPackage(null); // CreatePackageModal handles this internally via editingPackage prop if passed
          }}
          editingPackage={pkg}
          onSuccess={handleEditPackageSuccess}
        />

        {/* Edit Template Modal */}
        {selectedTemplate && (
          <EditTemplateModal
            isOpen={isEditTemplateOpen}
            onClose={() => {
              onEditTemplateClose();
              setSelectedTemplate(null);
            }}
            packageId={pkg.id}
            template={selectedTemplate}
            onSuccess={handleEditTemplateSuccess}
          />
        )}
      </Container>
    </SidebarContent>
  );
};

export default PackageDetailPage;

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
