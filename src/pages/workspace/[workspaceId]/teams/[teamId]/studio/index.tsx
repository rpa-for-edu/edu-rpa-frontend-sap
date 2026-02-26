import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  useToast,
  Select,
  HStack,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { SearchIcon, QuestionIcon } from '@chakra-ui/icons';
import TeamLayout from '@/components/Layouts/TeamLayout';
import SidebarContent from '@/components/Sidebar/SidebarContent/SidebarContent';
import CustomTable from '@/components/CustomTable/CustomTable';
import {
  useTeamProcesses,
  useDeleteTeamProcess,
  useCurrentTeamMember,
  useCreateTeamProcess,
} from '@/hooks/useTeam';
import { ToolTipExplain } from '@/constants/description';
import { hasTeamPermission } from '@/utils/teamPermissions';
import { TeamMember } from '@/types/team';
import { formatDateTime } from '@/utils/time';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import { defaultXML, generateProcessID } from '@/utils/processService';
import { GetServerSideProps } from 'next';
import { getServerSideTranslations } from '@/utils/i18n';
import { useTranslation } from 'next-i18next';

export default function TeamStudioPage() {
  const router = useRouter();
  const { workspaceId, teamId } = router.query;
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [deleteProcessId, setDeleteProcessId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('processes');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('desc');
  const toast = useToast();
  const { t } = useTranslation('workspace');

  // Modal refs and state for creating new process
  const initialRef = useRef<HTMLInputElement>(null);
  const descRepf = useRef<HTMLInputElement>(null);
  const finalRef = useRef<HTMLButtonElement>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  // Fetch current team member with role and permissions
  const {
    data: teamMember,
    isLoading: isLoadingMember,
    error: memberError,
  } = useCurrentTeamMember(teamId as string);

  const { data: processesData, isLoading, error: processesError } = useTeamProcesses(
    teamId as string,
    page,
    10
  );
  const deleteMutation = useDeleteTeamProcess(teamId as string);
  const createMutation = useCreateTeamProcess(teamId as string);

  // Grant full permissions to all users (permission API not implemented yet)
  const canViewProcesses = true;
  const canCreateProcess = true;
  const canEditProcess = true;
  const canDeleteProcess = true;

  const handleCreateProcess = () => {
    onCreateOpen();
  };

  const handleCreateNewProcess = async () => {
    const processName = initialRef.current?.value?.trim();
    const processDesc = descRepf.current?.value?.trim();

    if (!processName) {
      toast({
        title: t('team.studio.nameRequired'),
        status: 'error',
        position: 'top-right',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const processID = generateProcessID();
    const xml = defaultXML(processID);

    try {
      const result = await createMutation.mutateAsync({
        id: processID,
        name: processName,
        description: processDesc || '',
        xml: xml,
        activities: [],
        variables: {},
      });

      toast({
        title: t('team.studio.processCreated'),
        status: 'success',
        position: 'top-right',
        duration: 2000,
        isClosable: true,
      });

      onCreateClose();

      // Small delay to ensure backend has processed the creation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Navigate to modeler
      router.push(
        `/workspace/${workspaceId}/teams/${teamId}/studio/modeler/${processID}?name=${processName}&version=0`
      );
    } catch (error) {
      console.error('❌ Failed to create team process:', error);
      toast({
        title: t('team.studio.failedToCreate'),
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditProcess = (processId: string) => {
    router.push(
      `/workspace/${workspaceId}/teams/${teamId}/studio/modeler/${processId}`
    );
  };

  const handleViewProcess = (processId: string) => {
    router.push(
      `/workspace/${workspaceId}/teams/${teamId}/studio/modeler/${processId}`
    );
  };

  const handleDeleteClick = (processId: string) => {
    setDeleteProcessId(processId);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (deleteProcessId) {
      await deleteMutation.mutateAsync(deleteProcessId);
      setDeleteProcessId(null);
      onDeleteClose();
    }
  };

  const handleSortToggle = () => {
    if (sortOrder === 'desc') {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder(null);
    } else {
      setSortOrder('desc');
    }
  };

  const handleDeleteProcessByID = (processID: string) => {
    setDeleteProcessId(processID);
    onDeleteOpen();
  };

  const handleEditProcessByID = (
    processID: string,
    name: string,
    version: number
  ) => {
    router.push(
      `/workspace/${workspaceId}/teams/${teamId}/studio/modeler/${processID}`
    );
  };

  const handleDownloadProcessByID = (processID: string) => {
    toast({
      title: t('team.studio.downloadComingSoon'),
      status: 'info',
      position: 'top-right',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDuplicateProcess = (processID: string) => {
    toast({
      title: t('team.studio.duplicateComingSoon'),
      status: 'info',
      position: 'top-right',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleShareProcess = (processID: string) => {
    toast({
      title: t('team.studio.shareComingSoon'),
      status: 'info',
      position: 'top-right',
      duration: 2000,
      isClosable: true,
    });
  };

  const handlePinProcess = (processID: string) => {
    toast({
      title: t('team.studio.pinComingSoon'),
      status: 'info',
      position: 'top-right',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleProcessSettings = (processID: string) => {
    toast({
      title: t('team.studio.settingsComingSoon'),
      status: 'info',
      position: 'top-right',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleImportBPMN = () => {
    toast({
      title: t('team.studio.importComingSoon'),
      status: 'info',
      position: 'top-right',
      duration: 2000,
      isClosable: true,
    });
  };

  // Format and filter data
  const formatData =
    processesData?.processes?.map((item: any) => {
      return {
        id: item.id,
        name: item.name,
        description: item.description || '',
        sharedBy: item.createdBy || 'me',
        last_modified: formatDateTime(item.updatedAt),
        last_modified_timestamp: new Date(item.updatedAt).getTime(),
        version: item.version,
        status: item.status || 'draft',
        pinned: false,
      };
    }) || [];

  let filteredData = formatData;

  // Search by name
  if (searchQuery) {
    filteredData = filteredData.filter((item: any) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filter by owner
  if (ownerFilter && ownerFilter !== 'all') {
    filteredData = filteredData.filter(
      (item: any) => item.sharedBy === ownerFilter
    );
  }

  // Filter by status
  if (statusFilter && statusFilter !== 'all') {
    filteredData = filteredData.filter(
      (item: any) => item.status === statusFilter
    );
  }

  // Sort by last modified
  if (sortOrder) {
    filteredData = [...filteredData].sort((a: any, b: any) => {
      if (sortOrder === 'asc') {
        return a.last_modified_timestamp - b.last_modified_timestamp;
      } else {
        return b.last_modified_timestamp - a.last_modified_timestamp;
      }
    });
  }

  const tableProps = {
    header: [
      t('team.studio.table.name'),
      t('team.studio.table.description'),
      t('team.studio.table.owner'),
      t('team.studio.table.lastModified'),
      t('team.studio.table.version'),
      t('team.studio.table.status'),
    ],
    headerKeys: [
      'name',
      'description',
      'sharedBy',
      'last_modified',
      'version',
      'status',
    ],
    data: filteredData,
  };

  if (!canViewProcesses) {
    return (
      <TeamLayout>
        <div className="mb-[200px]">
          <SidebarContent>
            <Box textAlign="center" py={10}>
              <Text fontSize="xl" fontWeight="bold" color="red.500">
                {t('team.studio.accessDenied')}
              </Text>
              <Text color="gray.600" mt={2}>
                {t('team.studio.noPermission')}
              </Text>
            </Box>
          </SidebarContent>
        </div>
      </TeamLayout>
    );
  }

  // Handle API error (403 Forbidden, etc.)
  if (processesError) {
    const errorStatus = (processesError as any)?.response?.status;
    const errorMessage = errorStatus === 403 
      ? t('team.studio.noPermission')
      : (processesError as any)?.response?.data?.message || t('team.studio.failedToLoad');
    
    return (
      <TeamLayout>
        <div className="mb-[200px]">
          <SidebarContent>
            <h1 className="pl-[20px] ml-[35px] font-bold text-2xl text-[#319795]">
              {t('team.studio.title')}
            </h1>
            <Box mt={6} mx="auto" maxW="600px">
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>{t('team.studio.errorLoading')}</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Box>
              </Alert>
            </Box>
          </SidebarContent>
        </div>
      </TeamLayout>
    );
  }


  return (
    <TeamLayout>
      <div className="mb-[200px]">
        <SidebarContent>
          <div className="flex items-center justify-between w-90 mx-auto mb-[10px]">
            <div className="relative flex items-center gap-[30px] border-b border-gray-200">
              <button
                onClick={() => setActiveTab('processes')}
                className={`px-4 py-3 font-semibold text-lg transition-colors duration-300 ${
                  activeTab === 'processes'
                    ? 'text-[#319795]'
                    : 'text-gray-600 hover:text-[#319795]'
                }`}
              >
                {t('team.studio.tabs.processes')}
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-3 font-semibold text-lg transition-colors duration-300 ${
                  activeTab === 'templates'
                    ? 'text-[#319795]'
                    : 'text-gray-600 hover:text-[#319795]'
                }`}
              >
                {t('team.studio.tabs.templates')}
              </button>
              {/* Sliding underline */}
              <div
                className={`absolute bottom-0 h-[3px] bg-[#319795] transition-all duration-300 ease-in-out ${
                  activeTab === 'processes'
                    ? 'left-0 w-[130px]'
                    : 'left-[150px] w-[120px]'
                }`}
              ></div>
            </div>
            <Tooltip
              hasArrow
              label={ToolTipExplain.STUDIO_SERVICE}
              bg="gray.300"
              color="black"
            >
              <QuestionIcon color="blue.500" />
            </Tooltip>
          </div>

          {activeTab === 'processes' && (
            <>
              <div className="flex justify-between w-90 mx-auto my-[25px]">
                <div className="flex gap-[10px] items-center">
                  <InputGroup width="320px">
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.500" />
                    </InputLeftElement>
                    <Input
                      bg="white"
                      type="text"
                      placeholder={t('team.studio.search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                  <Box>
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        {t('team.studio.owner')}
                      </Text>
                      <Select
                        size="sm"
                        width="80px"
                        bg="white"
                        value={ownerFilter}
                        onChange={(e) => setOwnerFilter(e.target.value)}
                      >
                        <option value="all">{t('team.studio.all')}</option>
                        {processesData?.processes &&
                          Array.from(
                            new Set(
                              processesData.processes.map(
                                (p: any) => p.createdBy || 'me'
                              )
                            )
                          ).map((owner: any) => (
                            <option key={owner} value={owner}>
                              {owner}
                            </option>
                          ))}
                      </Select>
                    </HStack>
                  </Box>
                  <Box>
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        {t('team.studio.status')}
                      </Text>
                      <Select
                        size="sm"
                        width="80px"
                        bg="white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">{t('team.studio.all')}</option>
                        <option value="draft">{t('team.studio.draft')}</option>
                        <option value="deployed">{t('team.studio.deployed')}</option>
                      </Select>
                    </HStack>
                  </Box>
                </div>
                <div className="flex justify-between gap-[10px]">
                  {canCreateProcess && (
                    <Button colorScheme="teal" onClick={onCreateOpen}>
                      {t('team.studio.newProcess')}
                    </Button>
                  )}
                  <input
                    type="file"
                    id="myFile"
                    name="filename"
                    className="hidden"
                    ref={inputFileRef}
                    onChange={handleImportBPMN}
                  />
                  <Button
                    variant="outline"
                    colorScheme="teal"
                    onClick={() => {
                      if (inputFileRef.current) {
                        inputFileRef.current.click();
                      }
                    }}
                  >
                    {t('team.studio.importProcess')}
                  </Button>
                </div>
              </div>

              <div className="w-90 m-auto">
                <CustomTable
                  header={tableProps.header}
                  headerKeys={tableProps.headerKeys}
                  data={tableProps.data}
                  onView={handleEditProcessByID}
                  onDownload={handleDownloadProcessByID}
                  onDelete={handleDeleteProcessByID}
                  onDuplicate={handleDuplicateProcess}
                  onShare={handleShareProcess}
                  onPin={handlePinProcess}
                  onProcessSettings={handleProcessSettings}
                  sortOrder={sortOrder}
                  onSortChange={handleSortToggle}
                  isLoading={isLoading}
                />
              </div>

              {tableProps.data.length === 0 && !isLoading && (
                <div className="w-90 m-auto flex justify-center items-center mt-10">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{t('team.studio.noProcesses')}</div>
                    <div className="text-gray-500">
                      {t('team.studio.createOrSwitch')}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'templates' && (
            <div className="w-90 m-auto flex justify-center items-center mt-10">
              <div className="text-center">
                <div className="text-2xl font-bold">{t('team.studio.templatesComingSoon')}</div>
                <div className="text-gray-500">
                  {t('team.studio.templatesAvailableHere')}
                </div>
              </div>
            </div>
          )}
        </SidebarContent>
      </div>

      <ConfirmModal
        title={t('team.studio.deleteTitle')}
        content={t('team.studio.deleteConfirmation')}
        isOpen={isDeleteOpen}
        isLoading={deleteMutation.isPending}
        onClose={onDeleteClose}
        onConfirm={handleDeleteConfirm}
      />

      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isCreateOpen}
        onClose={onCreateClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('team.studio.createModal.title')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>{t('team.studio.createModal.nameLabel')}</FormLabel>
              <Input ref={initialRef} placeholder={t('team.studio.createModal.namePlaceholder')} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>{t('team.studio.createModal.descLabel')}</FormLabel>
              <Input ref={descRepf} placeholder={t('team.studio.createModal.descPlaceholder')} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              variant="outline"
              mr={3}
              onClick={onCreateClose}
            >
              {t('team.studio.createModal.cancel')}
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleCreateNewProcess}
              isLoading={createMutation.isPending}
            >
              {t('team.studio.createModal.save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </TeamLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await getServerSideTranslations(context, [
        'common',
        'sidebar',
        'navbar',
        'workspace',
      ])),
    },
  };
};
