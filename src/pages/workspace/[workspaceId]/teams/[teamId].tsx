import React, { useEffect, useState } from 'react';
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
  IconButton,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
} from '@chakra-ui/react';
import { SearchIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import TeamLayout from '@/components/Layouts/TeamLayout';
import { Team, TeamMember, Role } from '@/interfaces/workspace';
import workspaceApi from '@/apis/workspaceApi';
import activityPackageApi from '@/apis/activityPackageApi';
import { ActivityPackage } from '@/interfaces/activity-package';
import InviteMemberModal from '@/components/Workspace/InviteMemberModal';
import AddPackageModal from '@/components/Workspace/AddPackageModal';
import CreateRoleModal from '@/components/Workspace/CreateRoleModal';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import { FaTrash, FaEdit, FaEllipsisV } from 'react-icons/fa';
import { MdArrowDropDown } from 'react-icons/md';
import { COLORS } from '@/constants/colors';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { getServerSideTranslations } from '@/utils/i18n';

const TeamDetailPage: React.FC = () => {
  const { t } = useTranslation('workspace');
  const router = useRouter();
  const toast = useToast();
  const { workspaceId, teamId } = router.query as {
    workspaceId: string;
    teamId: string;
  };
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [activityPackages, setActivityPackages] = useState<ActivityPackage[]>(
    []
  );
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPackageQuery, setSearchPackageQuery] = useState('');
  const [searchRoleQuery, setSearchRoleQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterPackageRole, setFilterPackageRole] = useState<string>('all');
  const {
    isOpen: isInviteOpen,
    onOpen: onInviteOpen,
    onClose: onInviteClose,
  } = useDisclosure();
  const {
    isOpen: isRoleOpen,
    onOpen: onRoleOpen,
    onClose: onRoleClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteMemberOpen,
    onOpen: onDeleteMemberOpen,
    onClose: onDeleteMemberClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteRoleOpen,
    onOpen: onDeleteRoleOpen,
    onClose: onDeleteRoleClose,
  } = useDisclosure();
  const {
    isOpen: isAddPackageOpen,
    onOpen: onAddPackageOpen,
    onClose: onAddPackageClose,
  } = useDisclosure();
  const {
    isOpen: isDeletePackageOpen,
    onOpen: onDeletePackageOpen,
    onClose: onDeletePackageClose,
  } = useDisclosure();
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);
  const [pendingRoleId, setPendingRoleId] = useState<string | null>(null);
  const [pendingPackageId, setPendingPackageId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (workspaceId && teamId) {
      fetchTeamData();
      fetchMembers();
      fetchRoles();
      fetchActivityPackages();
    }
  }, [workspaceId, teamId]);

  useEffect(() => {
    let filtered = members.filter(
      (member) =>
        member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterRole !== 'all') {
      filtered = filtered.filter((member) => member.roleId === filterRole);
    }

    setFilteredMembers(filtered);
  }, [searchQuery, members, filterRole]);

  const fetchTeamData = async () => {
    try {
      const data = await workspaceApi.getTeamById(teamId);
      setTeam(data);
    } catch (error) {
      console.error('Failed to fetch team:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await workspaceApi.getTeamMembers(teamId);
      setMembers(data);
      setFilteredMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch members',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await workspaceApi.getRolesByTeam(teamId);
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchActivityPackages = async () => {
    try {
      const data = await activityPackageApi.getPackagesByTeam(teamId);
      setActivityPackages(data);
    } catch (error) {
      console.error('Failed to fetch activity packages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch activity packages',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedMembers(filteredMembers.map((m) => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleSelectMember = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleRemoveMember = async (memberId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingMemberId(memberId);
    onDeleteMemberOpen();
  };

  const confirmRemoveMember = async () => {
    if (!pendingMemberId) return;

    try {
      setIsSubmitting(true);
      await workspaceApi.removeTeamMember(teamId, pendingMemberId);
      toast({
        title: 'Success',
        description: 'Member removed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchMembers();
      onDeleteMemberClose();
      setPendingMemberId(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to remove member',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, roleId: string) => {
    try {
      console.log('Updating member role:', roleId);
      await workspaceApi.updateTeamMemberRole(teamId, memberId, {
        roleId,
      });
      toast({
        title: 'Success',
        description: 'Member role updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to update member role',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    setPendingRoleId(roleId);
    onDeleteRoleOpen();
  };

  const confirmDeleteRole = async () => {
    if (!pendingRoleId) return;

    try {
      setIsSubmitting(true);
      await workspaceApi.deleteRole(teamId, pendingRoleId);
      toast({
        title: 'Success',
        description: 'Role deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchRoles();
      onDeleteRoleClose();
      setPendingRoleId(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete role',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePackage = (packageId: string) => {
    setPendingPackageId(packageId);
    onDeletePackageOpen();
  };

  const confirmDeletePackage = async () => {
    if (!pendingPackageId) return;

    try {
      setIsSubmitting(true);
      await workspaceApi.removePackageFromTeam(teamId, pendingPackageId);
      toast({
        title: 'Success',
        description: 'Package removed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchActivityPackages();
      onDeletePackageClose();
      setPendingPackageId(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to remove package',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TeamLayout>
      <Container maxW="container.xl" py={5}>
        <Breadcrumb
          spacing="8px"
          separator={<ChevronRightIcon color="gray.500" />}
          mb={4}
        >
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => router.push('/workspace')}>
              {t('workspaces')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => router.push(`/workspace/${workspaceId}/teams`)}
            >
              {t('teams')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{team?.name || t('team.member')}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Team Header */}
        <Box
          bg="white"
          borderRadius="lg"
          shadow="sm"
          color={COLORS.primary}
          mb={6}
        >
          <Stack spacing={1}>
            <Heading size="lg">{team?.name}</Heading>
            <Text color="gray.500">
              {team?.description || t('teamDetail.noDescription')}
            </Text>
          </Stack>
        </Box>

        {/* Members Section */}
        <Flex justify="space-between" align="center">
          <Heading size="md" color={COLORS.primary}>
            {t('teamDetail.members')}
          </Heading>
        </Flex>

        <Box bg="white" borderRadius="lg" shadow="sm" p={4} mb={8}>
          <Flex justify="space-between" align="center" mb={4} gap={4}>
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder={t('teamDetail.findMember')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            <Button colorScheme="teal" onClick={onInviteOpen}>
              {t('teamDetail.addMember')}
            </Button>
          </Flex>

          <Stack spacing={0}>
            <Flex
              bg="gray.100"
              p={3}
              borderTopRadius="md"
              align="center"
              justify="space-between"
            >
              <Flex align="center" gap={4}>
                <Checkbox
                  checked={
                    selectedMembers.length === filteredMembers.length &&
                    filteredMembers.length > 0
                  }
                  onChange={handleSelectAll}
                >
                  {t('teamDetail.selectAll')}
                </Checkbox>
              </Flex>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<MdArrowDropDown />}
                  maxW="200px"
                  bg={COLORS.bgWhite}
                  border="1px"
                  borderColor="gray.200"
                  _hover={{ bg: 'gray.50' }}
                  _active={{ bg: 'gray.100' }}
                  textAlign="left"
                  fontWeight="normal"
                >
                  {filterRole === 'all'
                    ? t('teamDetail.allRoles')
                    : roles.find((r) => r.id === filterRole)?.name ||
                      t('teamDetail.allRoles')}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setFilterRole('all')}>
                    {t('teamDetail.allRoles')}
                  </MenuItem>
                  {roles.map((role) => (
                    <MenuItem
                      key={role.id}
                      onClick={() => setFilterRole(role.id)}
                    >
                      {role.name}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Flex>

            {filteredMembers.map((member) => (
              <Flex
                key={member.id}
                p={3}
                borderBottom="1px"
                borderColor="gray.200"
                align="center"
                justify="space-between"
              >
                <Flex align="center" gap={4} flex={1}>
                  <Checkbox
                    isChecked={selectedMembers.includes(member.id)}
                    onChange={() => handleSelectMember(member.id)}
                  />
                  <Avatar
                    size="sm"
                    name={member.user.name}
                    src={member.user.avatarUrl || undefined}
                  />
                  <Stack spacing={0}>
                    <Text fontWeight="medium">{member.user.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {member.user.email}
                    </Text>
                  </Stack>
                </Flex>

                <Flex gap={4} align="center">
                  <Select
                    key={`${member.id}-${member.roleId}`}
                    size="sm"
                    minW="150px"
                    defaultValue={member.roleId || ''}
                    onChange={(e) => {
                      const newRoleId = e.target.value;
                      console.log('Event target:', e.target);
                      console.log('Current member.roleId:', member.roleId);
                      console.log('Selected newRoleId:', newRoleId);
                      console.log(
                        'All options:',
                        Array.from(e.target.options).map((o) => ({
                          value: o.value,
                          text: o.text,
                          selected: o.selected,
                        }))
                      );

                      if (newRoleId && newRoleId !== member.roleId) {
                        handleUpdateMemberRole(member.id, newRoleId);
                      }
                    }}
                  >
                    <option value="">{t('teamDetail.noRole')}</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </Select>
                  <IconButton
                    aria-label={t('teamDetail.removeMemberTitle')}
                    icon={<FaTrash />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={(e) => handleRemoveMember(member.id, e)}
                  />
                </Flex>
              </Flex>
            ))}

            {filteredMembers.length === 0 && (
              <Box p={8} textAlign="center">
                <Text color="gray.500">{t('teamDetail.noMembersFound')}</Text>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Activity Packages Section */}
        <Flex justify="space-between" align="center" mt={4}>
          <Heading size="md" color={COLORS.primary}>
            {t('teamDetail.activityPackage')}
          </Heading>
        </Flex>

        <Box bg="white" borderRadius="lg" shadow="sm" p={4} mb={8}>
          <Flex mb={4} justify="space-between" align="center">
            <InputGroup maxW={400}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder={t('teamDetail.findPackage')}
                value={searchPackageQuery}
                onChange={(e) => setSearchPackageQuery(e.target.value)}
              />
            </InputGroup>
            <Button colorScheme="teal" onClick={onAddPackageOpen}>
              {t('teamDetail.addPackage')}
            </Button>
          </Flex>

          <Stack spacing={0}>
            <Flex
              bg="gray.100"
              p={3}
              borderTopRadius="md"
              align="center"
              justify="space-between"
            >
              <Text fontWeight="medium">{t('teamDetail.packageName')}</Text>
            </Flex>

            {activityPackages
              .filter((pkg) =>
                pkg.displayName
                  .toLowerCase()
                  .includes(searchPackageQuery.toLowerCase())
              )
              .map((pkg) => (
                <Flex
                  key={pkg.id}
                  p={3}
                  borderBottom="1px"
                  borderColor="gray.200"
                  align="center"
                  justify="space-between"
                >
                  <Flex align="center" gap={4} flex={1}>
                    <Avatar size="sm" name={pkg.displayName} />
                    <Stack spacing={0}>
                      <Text fontWeight="medium">{pkg.displayName}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {pkg.description || t('teamDetail.noDescriptionPackage')}
                      </Text>
                    </Stack>
                  </Flex>

                  <IconButton
                    aria-label={t('teamDetail.removePackageTitle')}
                    icon={<FaTrash />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleDeletePackage(pkg.id)}
                  />
                </Flex>
              ))}

            {activityPackages.filter((pkg) =>
              pkg.displayName
                .toLowerCase()
                .includes(searchPackageQuery.toLowerCase())
            ).length === 0 && (
              <Box p={8} textAlign="center">
                <Text color="gray.500">{t('teamDetail.noPackagesFound')}</Text>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Roles Section */}
        <Flex justify="space-between" align="center" mt={4}>
          <Heading size="md" color={COLORS.primary}>
            {t('teamDetail.teamRoles')}
          </Heading>
        </Flex>

        <Box bg="white" borderRadius="lg" shadow="sm" p={4} mb={6}>
          <Flex mb={4} justify="space-between" align="center">
            <InputGroup maxW={400}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder={t('teamDetail.findRole')}
                value={searchRoleQuery}
                onChange={(e) => setSearchRoleQuery(e.target.value)}
              />
            </InputGroup>
            <Button
              colorScheme="teal"
              onClick={() =>
                router.push(
                  `/workspace/${workspaceId}/teams/roles/create?teamId=${teamId}`
                )
              }
            >
              {t('teamDetail.createRole')}
            </Button>
          </Flex>

          <Stack spacing={0}>
            <Flex
              bg="gray.100"
              p={3}
              borderTopRadius="md"
              align="center"
              justify="space-between"
            >
              <Text fontWeight="medium">{t('teamDetail.roleName')}</Text>
            </Flex>

            {roles
              .filter((role) =>
                role.name.toLowerCase().includes(searchRoleQuery.toLowerCase())
              )
              .map((role) => (
                <Flex
                  key={role.id}
                  p={3}
                  borderBottom="1px"
                  borderColor="gray.200"
                  align="center"
                  justify="space-between"
                >
                  <Stack spacing={0} flex={1}>
                    <Text fontWeight="medium">{role.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {role.description || t('teamDetail.noDescription')}
                    </Text>
                  </Stack>

                  <Flex gap={2}>
                    <IconButton
                      aria-label="Edit role"
                      icon={<FaEdit />}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() =>
                        router.push(
                          `/workspace/${workspaceId}/teams/roles/${role.id}/edit?teamId=${teamId}`
                        )
                      }
                    />
                    <IconButton
                      aria-label="Delete role"
                      icon={<FaTrash />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeleteRole(role.id)}
                    />
                  </Flex>
                </Flex>
              ))}

            {roles.filter((role) =>
              role.name.toLowerCase().includes(searchRoleQuery.toLowerCase())
            ).length === 0 && (
              <Box p={8} textAlign="center">
                <Text color="gray.500">{t('teamDetail.noRolesFound')}</Text>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Back Button */}
        <Flex justify="flex-end" mt={6}>
          <Button
            colorScheme="teal"
            size="lg"
            w={130}
            onClick={() => router.back()}
          >
            {t('teamDetail.back')}
          </Button>
        </Flex>
      </Container>

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={onInviteClose}
        workspaceId={workspaceId}
        teamId={teamId}
        defaultRoleId={roles.length > 0 ? roles[0].id : undefined}
        onSuccess={fetchMembers}
      />

      <CreateRoleModal
        isOpen={isRoleOpen}
        onClose={onRoleClose}
        workspaceId={workspaceId}
        teamId={teamId}
        onSuccess={fetchRoles}
      />

      <ConfirmModal
        title={t('teamDetail.removeMemberTitle')}
        content={t('teamDetail.removeMemberContent')}
        isOpen={isDeleteMemberOpen}
        isLoading={isSubmitting}
        onClose={onDeleteMemberClose}
        onConfirm={confirmRemoveMember}
      />

      <ConfirmModal
        title={t('teamDetail.deleteRoleTitle')}
        content={t('teamDetail.deleteRoleContent')}
        isOpen={isDeleteRoleOpen}
        isLoading={isSubmitting}
        onClose={onDeleteRoleClose}
        onConfirm={confirmDeleteRole}
      />

      <AddPackageModal
        isOpen={isAddPackageOpen}
        onClose={onAddPackageClose}
        teamId={teamId}
        existingPackageIds={activityPackages.map((pkg) => pkg.id)}
        onSuccess={fetchActivityPackages}
      />

      <ConfirmModal
        title={t('teamDetail.removePackageTitle')}
        content={t('teamDetail.removePackageContent')}
        isOpen={isDeletePackageOpen}
        isLoading={isSubmitting}
        onClose={onDeletePackageClose}
        onConfirm={confirmDeletePackage}
      />
    </TeamLayout>
  );
};

export default TeamDetailPage;

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
