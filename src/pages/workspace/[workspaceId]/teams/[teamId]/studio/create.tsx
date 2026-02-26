import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  useToast,
  Heading,
  Card,
  CardBody,
  FormHelperText,
  Text,
} from '@chakra-ui/react';
import TeamLayout from '@/components/Layouts/TeamLayout';
import SidebarContent from '@/components/Sidebar/SidebarContent/SidebarContent';
import { useCreateTeamProcess, useCurrentTeamMember } from '@/hooks/useTeam';
import { hasTeamPermission } from '@/utils/teamPermissions';
import { GetServerSideProps } from 'next';
import { getServerSideTranslations } from '@/utils/i18n';
import { useTranslation } from 'next-i18next';

export default function CreateTeamProcessPage() {
  const router = useRouter();
  const toast = useToast();
  const { workspaceId, teamId } = router.query;
  const { t } = useTranslation('workspace');

  // Fetch current team member
  const {
    data: teamMember,
    isLoading: isLoadingMember,
    error: memberError,
  } = useCurrentTeamMember(teamId as string);

  // Check permissions - if loading, has error, or no member, assume full permissions
  const canCreateProcess =
    isLoadingMember || memberError || !teamMember
      ? true
      : hasTeamPermission(teamMember, 'create_process');

  const [processName, setProcessName] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useCreateTeamProcess(teamId as string);

  const handleSubmit = async () => {
    if (!processName.trim()) {
      toast({
        title: t('team.studio.nameRequired'),
        status: 'error',
        position: 'top-right',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      const newProcess = await createMutation.mutateAsync({
        name: processName,
        description: description,
        activities: [],
        variables: {},
      });

      // Navigate to modeler to edit the new process
      router.push(
        `/workspace/${workspaceId}/teams/${teamId}/studio/modeler/${newProcess.id}`
      );
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  if (!canCreateProcess) {
    return (
      <TeamLayout>
        <SidebarContent>
          <Box textAlign="center" py={10}>
            <Text fontSize="xl" fontWeight="bold" color="red.500">
              {t('team.studio.createProcess.accessDenied')}
            </Text>
            <Text color="gray.600" mt={2}>
              {t('team.studio.createProcess.noPermission')}
            </Text>
          </Box>
        </SidebarContent>
      </TeamLayout>
    );
  }

  return (
    <TeamLayout>
      <SidebarContent>
        <Box px={8} py={6}>
          <Heading size="lg" mb={6} color="teal.600">
            {t('team.studio.createProcess.title')}
          </Heading>

          <Card maxW="800px">
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Process Name */}
                <FormControl isRequired>
                  <FormLabel>{t('team.studio.createProcess.nameLabel')}</FormLabel>
                  <Input
                    placeholder={t('team.studio.createProcess.namePlaceholder')}
                    value={processName}
                    onChange={(e) => setProcessName(e.target.value)}
                    bg="white"
                  />
                  <FormHelperText>
                    {t('team.studio.createProcess.nameHelper')}
                  </FormHelperText>
                </FormControl>

                {/* Description */}
                <FormControl>
                  <FormLabel>{t('team.studio.createProcess.descLabel')}</FormLabel>
                  <Textarea
                    placeholder={t('team.studio.createProcess.descPlaceholder')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    bg="white"
                    rows={4}
                  />
                  <FormHelperText>
                    {t('team.studio.createProcess.descHelper')}
                  </FormHelperText>
                </FormControl>

                {/* Action Buttons */}
                <HStack justify="flex-end" spacing={4} pt={4}>
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    isDisabled={createMutation.isPending}
                  >
                    {t('team.studio.createProcess.cancel')}
                  </Button>
                  <Button
                    colorScheme="teal"
                    onClick={handleSubmit}
                    isLoading={createMutation.isPending}
                    loadingText={t('team.studio.createProcess.submitting')}
                  >
                    {t('team.studio.createProcess.submit')}
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </SidebarContent>
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
