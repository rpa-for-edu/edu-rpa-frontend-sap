import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast,
  Text,
  Box,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import erpNextConnectionApi, {
  CreateERPNextConnectionDto,
} from '@/apis/erpNextConnectionApi';
import { useTranslation } from 'next-i18next';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  workspaceId?: string;
}

const CreateERPNextConnectionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  workspaceId,
}) => {
  const { t } = useTranslation('integration-service');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      baseUrl: '',
      apiKey: '',
      apiSecret: '',
      name: '',
    },
    validationSchema: Yup.object({
      baseUrl: Yup.string()
        .url(t('modal.erpnext.validation.urlInvalid'))
        .matches(/^https?:\/\/.+/, t('modal.erpnext.validation.urlProtocol'))
        .required(t('modal.erpnext.validation.urlRequired')),
      apiKey: Yup.string().required(t('modal.erpnext.validation.apiKeyRequired', 'API Key is required')),
      apiSecret: Yup.string().required(t('modal.erpnext.validation.apiSecretRequired', 'API Secret is required')),
      name: Yup.string().max(100, t('modal.erpnext.validation.nameMax')),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const payload: CreateERPNextConnectionDto = {
          baseUrl: values.baseUrl,
          token: `${values.apiKey.trim()}:${values.apiSecret.trim()}`,
        };

        if (values.name.trim()) {
          payload.name = values.name;
        }

        let response;
        if (workspaceId) {
          // Workspace ERPNext connection
          response = await erpNextConnectionApi.createWorkspaceERPNextConnection(
            workspaceId,
            payload
          );
        } else {
          // User ERPNext connection
          response = await erpNextConnectionApi.createERPNextConnection(payload);
        }

        toast({
          title: t('modal.erpnext.success'),
          description: t('modal.erpnext.successDescription', {
            name: response.connection.name,
          }),
          status: 'success',
          position: 'top-right',
          duration: 3000,
          isClosable: true,
        });

        formik.resetForm();
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          t('modal.erpnext.errorDefault');

        toast({
          title: t('modal.erpnext.error'),
          description: errorMessage,
          status: 'error',
          position: 'top-right',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('modal.erpnext.title')}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formik.handleSubmit}>
          <ModalBody pb={6}>
            <Box mb={4}>
              <Text fontSize="sm" color="gray.600">
                {t('modal.erpnext.description')}
              </Text>
            </Box>

            {/* Base URL Field */}
            <FormControl
              isInvalid={formik.touched.baseUrl && !!formik.errors.baseUrl}
              mb={4}
            >
              <FormLabel htmlFor="baseUrl">
                {t('modal.erpnext.baseUrl')}{' '}
                <Text as="span" color="red.500">
                  {t('modal.erpnext.required')}
                </Text>
              </FormLabel>
              <Input
                id="baseUrl"
                name="baseUrl"
                type="url"
                placeholder={t('modal.erpnext.baseUrlPlaceholder')}
                value={formik.values.baseUrl}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.baseUrl && formik.errors.baseUrl && (
                <FormErrorMessage>{formik.errors.baseUrl}</FormErrorMessage>
              )}
            </FormControl>

            {/* API Key Field */}
            <FormControl
              isInvalid={formik.touched.apiKey && !!formik.errors.apiKey}
              mb={4}
            >
              <FormLabel htmlFor="apiKey">
                {t('modal.erpnext.apiKey', 'API Key')}{' '}
                <Text as="span" color="red.500">
                  {t('modal.erpnext.required')}
                </Text>
              </FormLabel>
              <Input
                id="apiKey"
                name="apiKey"
                type="text"
                placeholder={t('modal.erpnext.apiKeyPlaceholder', 'Enter API Key')}
                value={formik.values.apiKey}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.apiKey && formik.errors.apiKey && (
                <FormErrorMessage>{formik.errors.apiKey}</FormErrorMessage>
              )}
            </FormControl>

            {/* API Secret Field */}
            <FormControl
              isInvalid={formik.touched.apiSecret && !!formik.errors.apiSecret}
              mb={4}
            >
              <FormLabel htmlFor="apiSecret">
                {t('modal.erpnext.apiSecret', 'API Secret')}{' '}
                <Text as="span" color="red.500">
                  {t('modal.erpnext.required')}
                </Text>
              </FormLabel>
              <Input
                id="apiSecret"
                name="apiSecret"
                type="password"
                placeholder={t('modal.erpnext.apiSecretPlaceholder', 'Enter API Secret')}
                value={formik.values.apiSecret}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.apiSecret && formik.errors.apiSecret && (
                <FormErrorMessage>{formik.errors.apiSecret}</FormErrorMessage>
              )}
            </FormControl>

            {/* Name Field (Optional) */}
            <FormControl
              isInvalid={formik.touched.name && !!formik.errors.name}
            >
              <FormLabel htmlFor="name">
                {t('modal.erpnext.name')}{' '}
                <Text as="span" color="gray.500">
                  {t('modal.erpnext.nameOptional')}
                </Text>
              </FormLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder={t('modal.erpnext.namePlaceholder')}
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
              )}
              <Text fontSize="xs" color="gray.500" mt={1}>
                {t('modal.erpnext.nameHelp')}
              </Text>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              {t('modal.cancel')}
            </Button>
            <Button
              colorScheme="teal"
              type="submit"
              isLoading={isLoading}
              loadingText={t('modal.erpnext.creating')}
            >
              {t('modal.erpnext.createConnection')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateERPNextConnectionModal;
