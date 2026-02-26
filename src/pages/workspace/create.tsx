import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import SidebarContent from '@/components/Sidebar/SidebarContent/SidebarContent';
import { CreateWorkspaceDto } from '@/dtos/workspaceDto';
import workspaceApi from '@/apis/workspaceApi';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { getServerSideTranslations } from '@/utils/i18n';

const CreateWorkspacePage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation('workspace');
  const [formData, setFormData] = useState<CreateWorkspaceDto>({
    name: '',
    contactEmail: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.contactEmail) {
      toast({
        title: t('messages.error'),
        description: t('messages.pleaseFillRequired'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await workspaceApi.createWorkspace(formData);
      toast({
        title: t('messages.success'),
        description: t('messages.workspaceCreated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/workspace');
    } catch (error: any) {
      toast({
        title: t('messages.error'),
        description:
          error?.response?.data?.message || t('messages.failedToCreateWorkspace'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarContent>
      <Container maxW="container.md" py={8}>
        <Box
          bg="white"
          borderRadius="lg"
          shadow="md"
          p={8}
          border="1px"
          borderColor="gray.200"
        >
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" mb={4}>
              <Heading size="lg" mb={2}>
                {t('createYourWorkspace')}
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Workspace - Place for team work
              </Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>{t('workspaceName')}</FormLabel>
                  <Input
                    name="name"
                    placeholder={t('enterWorkspaceName')}
                    value={formData.name}
                    onChange={handleChange}
                    size="md"
                    borderRadius="5px"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>{t('contactEmail')}</FormLabel>
                  <Input
                    name="contactEmail"
                    type="email"
                    placeholder={t('enterContactEmail')}
                    value={formData.contactEmail}
                    onChange={handleChange}
                    size="md"
                    borderRadius="5px"
                  />
                </FormControl>

                <Flex gap={4} width="100%" mt={4}>
                  <Button
                    variant="outline"
                    size="lg"
                    flex={1}
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="teal"
                    size="lg"
                    flex={1}
                    isLoading={isLoading}
                  >
                    Create
                  </Button>
                </Flex>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Container>
    </SidebarContent>
  );
};

export default CreateWorkspacePage;

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
