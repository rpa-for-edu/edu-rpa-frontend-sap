import { useRouter } from 'next/router';
import TeamLayout from '@/components/Layouts/TeamLayout';
import SidebarContent from '@/components/Sidebar/SidebarContent/SidebarContent';
import { Box, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { getServerSideTranslations } from '@/utils/i18n';
import { useTranslation } from 'next-i18next';

export default function TeamDashboard() {
  const router = useRouter();
  const { workspaceId, teamId } = router.query;
  const { t } = useTranslation(['workspace']);

  return (
    <TeamLayout>
      <div className="mb-[200px]">
        <SidebarContent>
          <h1 className="pl-[20px] ml-[35px] font-bold text-2xl text-[#319795]">
            {t('workspace:team.dashboard')}
          </h1>
          
          <div className="w-90 mx-auto my-[30px]">
            <Box p={6} borderWidth="1px" borderRadius="lg" bg="white">
              <Text fontSize="lg" mb={4}>
                {t('teamDashboard.welcomeTitle')}
              </Text>
              <Text color="gray.600">
                {t('teamDashboard.teamId')}: {teamId}
              </Text>
              <Text color="gray.600">
                {t('teamDashboard.workspaceId')}: {workspaceId}
              </Text>
            </Box>
          </div>
        </SidebarContent>
      </div>
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

