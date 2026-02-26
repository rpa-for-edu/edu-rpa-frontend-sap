import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  GridItem,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Center,
} from '@chakra-ui/react';
import WorkspaceLayout from '@/components/Layouts/WorkspaceLayout';
import { Workspace } from '@/interfaces/workspace';
import workspaceApi from '@/apis/workspaceApi';
import { COLORS } from '@/constants/colors';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { getServerSideTranslations } from '@/utils/i18n';

const WorkspaceDashboard = () => {
  const router = useRouter();
  const { workspaceId } = router.query;
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation('workspace');

  useEffect(() => {
    if (workspaceId && typeof workspaceId === 'string') {
      fetchWorkspace(workspaceId);
    }
  }, [workspaceId]);

  const fetchWorkspace = async (id: string) => {
    try {
      setLoading(true);
      const data = await workspaceApi.getWorkspaceById(id);
      setWorkspace(data);
    } catch (error) {
      console.error('Failed to fetch workspace', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <WorkspaceLayout>
        <Center h="calc(100vh - 80px)">
          <Spinner size="xl" />
        </Center>
      </WorkspaceLayout>
    );
  }

  if (!workspace) {
    return (
      <WorkspaceLayout>
        <Container maxW="container.xl" py={8}>
          <Text>{t('dashboard.workspaceNotFound')}</Text>
        </Container>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading size="lg" mb={2} color={COLORS.primary}>
            {workspace.name}
          </Heading>
          {workspace.description && (
            <Text color="gray.600">{workspace.description}</Text>
          )}
        </Box>

        <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={8}>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>{t('dashboard.totalMembers')}</StatLabel>
                  <StatNumber>{workspace.members?.length || 0}</StatNumber>
                  <StatHelpText>{t('dashboard.activeMembers')}</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>{t('teams')}</StatLabel>
                  <StatNumber>{workspace.teams?.length || 0}</StatNumber>
                  <StatHelpText>{t('dashboard.totalTeams')}</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>{t('owner')}</StatLabel>
                  <StatNumber fontSize="md">{workspace.owner?.name}</StatNumber>
                  <StatHelpText>{workspace.owner?.email}</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        <Box>
          <Heading size="md" mb={4}>
            {t('dashboard.recentActivity')}
          </Heading>
          <Card>
            <CardBody>
              <Text color="gray.500">{t('dashboard.noRecentActivity')}</Text>
            </CardBody>
          </Card>
        </Box>
      </Container>
    </WorkspaceLayout>
  );
};

export default WorkspaceDashboard;

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
