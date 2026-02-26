import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  useDisclosure,
  Badge,
  useToast,
  Switch,
  HStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { SearchIcon } from '@chakra-ui/icons';
import SidebarContent from '@/components/Sidebar/SidebarContent/SidebarContent';
import activityPackageApi from '@/apis/activityPackageApi';
import type { ActivityPackage } from '@/interfaces/activity-package';
import { getDisplayText } from '@/utils/languageHelper';
import CreatePackageModal from '@/components/package/CreatePackageModal';
import { GetServerSideProps } from 'next';
import { getServerSideTranslations } from '@/utils/i18n';
import { COLORS } from '@/constants/colors';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import LoadingIndicator from '@/components/LoadingIndicator/LoadingIndicator';

const PackagesPage: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const toast = useToast();
  const [packages, setPackages] = useState<ActivityPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<ActivityPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const { 
    isOpen: isCreateOpen, 
    onOpen: onCreateOpen, 
    onClose: onCreateClose 
  } = useDisclosure();
  


  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [editingPackage, setEditingPackage] = useState<ActivityPackage | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    const defaultLang = i18n.language || 'en';
    const filtered = packages.filter((pkg) => {
      const displayName = getDisplayText(pkg, 'displayName', defaultLang).toLowerCase();
      const description = getDisplayText(pkg, 'description', defaultLang).toLowerCase();
      const name = pkg.name?.toLowerCase() || '';

      return (
        displayName.includes(searchQuery.toLowerCase()) ||
        name.includes(searchQuery.toLowerCase()) ||
        description.includes(searchQuery.toLowerCase())
      );
    });
    setFilteredPackages(filtered);
  }, [searchQuery, packages, i18n.language]);

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const data = await activityPackageApi.getAllPackages();
      setPackages(data);
      setFilteredPackages(data);
    } catch (error: any) {
      console.error('Failed to fetch packages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load packages',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };



  const handleToggleActive = async (pkg: ActivityPackage) => {
    try {
      await activityPackageApi.togglePackageActive(pkg.id);
      toast({
        title: 'Success',
        description: `Package ${pkg.isActive ? 'deactivated' : 'activated'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadPackages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to toggle status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleViewDetails = (pkg: ActivityPackage) => {
    router.push(`/admin/packages/${pkg.id}`);
  };

  const handleEditClick = (pkg: ActivityPackage, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPackage(pkg);
    onCreateOpen();
  };

  const handleDeleteClick = (packageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingDeleteId(packageId);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      setIsSubmitting(true);
      // Note: Delete endpoint would need to be added to API
      toast({
        title: 'Info',
        description: 'Delete functionality requires backend implementation',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      loadPackages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete package',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      onDeleteClose();
      setPendingDeleteId(null);
    }
  };

  const handleCreateSuccess = () => {
    onCreateClose();
    setEditingPackage(null);
    loadPackages();
  };

  if (isLoading) {
    return (
      <SidebarContent>
        <Container maxW="container.xl" py={5}>
          <LoadingIndicator />
        </Container>
      </SidebarContent>
    );
  }

  return (
    <SidebarContent>
      <Container maxW="container.xl" py={5}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg" color={COLORS.primary}>
            Package Management
          </Heading>
        </Flex>

        <Box bg="white" borderRadius="lg" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            <Button
              colorScheme="teal"
              onClick={() => {
                setEditingPackage(null);
                onCreateOpen();
              }}
            >
              New Package
            </Button>
          </Flex>

          <Stack spacing={0}>
            {/* Header Row */}
            <Flex
              bg="gray.100"
              p={3}
              borderTopRadius="md"
              align="center"
              justify="space-between"
            >
              <Flex align="center" gap={4} flex={1}>
                {/* Checkbox removed as per request */}
                <Text fontWeight="medium" pl={4}>Packages</Text>
              </Flex>
              <Flex align="center" gap={4}>
                <Text fontWeight="medium" minW="100px" textAlign="center">Templates</Text>
                <Text fontWeight="medium" minW="80px" textAlign="center">Status</Text>
                <Text fontWeight="medium" minW="120px" textAlign="center">Actions</Text>
              </Flex>
            </Flex>

            {/* Package Rows */}
            {filteredPackages.map((pkg) => (
              <Flex
                key={pkg.id}
                p={3}
                borderBottom="1px"
                borderColor="gray.200"
                align="center"
                justify="space-between"
                py={4}
                opacity={pkg.isActive ? 1 : 0.6}
                _hover={{ bg: 'gray.50' }}
                cursor="pointer"
                onClick={() => handleViewDetails(pkg)}
              >
                <Flex align="center" gap={4} flex={1}>
                  <Stack spacing={0} pl={4}>
                    <Flex align="center" gap={2}>
                      <Text
                        fontWeight="medium"
                        color="teal.600"
                      >
                        {getDisplayText(pkg, 'displayName', i18n.language || 'en')}
                      </Text>
                      {pkg.libraryFileName && (
                        <Badge colorScheme="purple" fontSize="xs">
                          {pkg.libraryFileType?.toUpperCase()}
                        </Badge>
                      )}
                    </Flex>
                    <Text fontSize="sm" color="gray.500">
                      ID: {pkg.id}
                      {pkg.library && ` • ${pkg.library}`}
                      {pkg.libraryVersion && ` (v${pkg.libraryVersion})`}
                    </Text>
                    {getDisplayText(pkg, 'description', i18n.language || 'en') && (
                      <Text fontSize="xs" color="gray.400" noOfLines={1}>
                        {getDisplayText(pkg, 'description', i18n.language || 'en')}
                      </Text>
                    )}
                  </Stack>
                </Flex>

                <Flex gap={4} align="center">
                  {/* Templates Count */}
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    minW="100px"
                    textAlign="center"
                  >
                    {pkg.activityTemplates?.length || 0} templates
                  </Text>

                  {/* Active Toggle */}
                  <HStack minW="80px" justify="center" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      size="sm"
                      colorScheme="teal"
                      isChecked={pkg.isActive}
                      onChange={() => handleToggleActive(pkg)}
                    />
                  </HStack>

                  {/* Actions */}
                  <HStack minW="120px" justify="center" spacing={2}>
                    <Box
                      onClick={(e) => handleEditClick(pkg, e)}
                      cursor="pointer"
                      px={3}
                      py={1}
                      border="1px"
                      borderColor="gray.400"
                      backgroundColor={COLORS.grayButton}
                      borderRadius="md"
                      _hover={{
                        bg: COLORS.primaryHover,
                        '& > p': { color: COLORS.bgWhite },
                      }}
                    >
                      <Text fontSize="13px" color="gray.700">
                        Edit
                      </Text>
                    </Box>
                    <Box
                      onClick={(e) => handleDeleteClick(pkg.id, e)}
                      cursor="pointer"
                      px={3}
                      py={1}
                      borderRadius="md"
                      backgroundColor={COLORS.red[500]}
                      _hover={{ opacity: 0.8 }}
                    >
                      <Text
                        fontSize="13px"
                        color={COLORS.bgGrayLight}
                        fontWeight="medium"
                      >
                        Delete
                      </Text>
                    </Box>
                  </HStack>
                </Flex>
              </Flex>
            ))}

            {filteredPackages.length === 0 && (
              <Box textAlign="center" py={8}>
                <Text color="gray.500">No packages found</Text>
              </Box>
            )}
          </Stack>
        </Box>
      </Container>

      {/* Create/Edit Modal */}
      <CreatePackageModal
        isOpen={isCreateOpen}
        onClose={() => {
          onCreateClose();
          setEditingPackage(null);
        }}
        editingPackage={editingPackage}
        onSuccess={handleCreateSuccess}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        title="Delete Package"
        content="Are you sure you want to delete this package? This action cannot be undone and will also delete all associated templates."
        isOpen={isDeleteOpen}
        isLoading={isSubmitting}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
      />
    </SidebarContent>
  );
};

export default PackagesPage;

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
