import connectionApi from '@/apis/connectionApi';
import moodleConnectionApi from '@/apis/moodleConnectionApi';
import erpNextConnectionApi from '@/apis/erpNextConnectionApi';
import { providerData } from '@/constants/providerData';
import { Connection } from '@/interfaces/connection';
import { userSelector } from '@/redux/selector';
import { AuthorizationProvider } from '@/interfaces/enums/provider.enum';
import {
  Box,
  Button,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  Td,
  Text,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { IoDocumentText } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import IconImage from '../IconImage/IconImage';
import { DeleteIcon, RepeatIcon } from '@chakra-ui/icons';
import { useMutation } from '@tanstack/react-query';
import { ActivateConnectionDto } from '@/dtos/connectionDto';
import { useRouter } from 'next/router';
import { formatDateTime } from '@/utils/time';
import { useTranslation } from 'next-i18next';

interface ConnectionRowProps {
  data: Connection;
  robotKey?: string;
  onView?: (connectionKey: string, provider: string, name: string) => void;
  onSelectedForRemove: (provider: string, name: string) => void;
}

const ConnectionRow = (props: ConnectionRowProps) => {
  const { t } = useTranslation('integration-service');
  const [isLoadingRefresh, setIsLoadingRefresh] = useState(false);
  const [status, setStatus] = useState('Connected');
  const user = useSelector(userSelector);
  const toast = useToast();
  const { connectionKey, userId, isActivate, ...data } = props.data;

  const handleRefreshConnection = async () => {
    setIsLoadingRefresh(true);
    try {
      // For Moodle connections, use the test endpoint
      if (data.provider === AuthorizationProvider.MOODLE) {
        await moodleConnectionApi.testMoodleConnection(data.name);
        setStatus('Connected');
      } else if (data.provider === AuthorizationProvider.ERP_NEXT) {
         const res = await erpNextConnectionApi.testERPNextConnection(data.name);
         if (res && res.isValid === false) {
            throw new Error(res.message || 'Connection invalid');
         }
         setStatus('Connected');
      } else {
        // For OAuth connections, use the existing refresh endpoint
        await connectionApi.refreshConnection(data.provider, data.name);
        setStatus('Connected');
      }
    } catch (error) {
      console.error(`Failed to refresh connection for ${data.provider}:`, error);
      setStatus('Disconnected');
    }
    setIsLoadingRefresh(false);
  };

  const handleReconnect = async () => {
    const provider = providerData.find(
      (provider) => provider.name === data.provider
    );
    if (provider) {
      // Moodle doesn't use OAuth, so we can't reconnect this way
      if (provider.name === AuthorizationProvider.MOODLE) {
        toast({
          title: t('row.cannotReconnectTitle'),
          description: t('row.cannotReconnectDesc'),
          status: 'warning',
          position: 'top-right',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      window.open(
        `${process.env.NEXT_PUBLIC_DEV_API}/auth/${provider.slug}?fromUser=${user.id}&reconnect=true`,
        '_blank'
      );
    }
  };

  useEffect(() => {
    handleRefreshConnection();
  }, []);

  const renderTableCell = (type: string, value: string) => {
    switch (type) {
      case 'status':
        return (
          <Tag
            colorScheme={value === 'Connected' ? 'green' : 'red'}
            size="md"
            p={3}
            rounded={10}
          >
            {value === 'Connected' ? t('row.connected') : t('row.disconnected')}
          </Tag>
        );
      case 'type':
        return (
          <Box className="flex justify-between">
            <Box className="flex justify-between">
              <IoDocumentText
                size="20px"
                className="hover:opacity-80 hover:cursor-pointer"
              />
              <Text className="text-[16px] ml-[10px]">{value}</Text>
            </Box>
            <Box></Box>
          </Box>
        );
      case 'provider':
        const provider = providerData.find((provider) => {
          return provider.name === value;
        });
        return (
          <Box className="flex justify-between items-center">
            {provider && <IconImage icon={provider.icon} label={provider.name} />}
          </Box>
        );
      case 'createdAt':
        return <Text>{formatDateTime(value)}</Text>;
      default:
        return <Text>{value}</Text>;
    }
  };

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleToggleActivateConnection = useMutation({
    mutationFn: async (payload: ActivateConnectionDto) => {
      return await connectionApi.activateConnection(props.robotKey, payload);
    },
    onSuccess: () => {
      router.reload();
    },
    onError: (error) => {
      // Error handled silently
    },
  });

  const handleActivate = (e: any) => {
    e.stopPropagation();
    onOpen();
  };

  return (
    <Tr
      _hover={{
        bg: '#4FD1C5',
        cursor: 'pointer',
        color: 'white',
        borderRadius: '15px',
      }}
      onClick={() =>
        props.onView && props.onView(connectionKey, data.provider, data.name)
      }
    >
      {Object.keys(data).map((key, columnIndex) => (
        <Td key={key}>{renderTableCell(key, data[key])}</Td>
      ))}
      <Td>
        {isLoadingRefresh ? (
          <Button
            isLoading
            loadingText={t('row.refreshing')}
            colorScheme="teal"
            variant="outline"
            size="sm"
            onClick={handleRefreshConnection}
          >
            {t('row.refresh')}
          </Button>
        ) : (
          <Tag
            colorScheme={status === 'Connected' ? 'green' : 'red'}
            size="md"
            p={3}
            rounded={10}
          >
            {status === 'Connected' ? t('row.connected') : t('row.disconnected')}
          </Tag>
        )}
      </Td>
      <Td>
        {isActivate !== undefined ? (
          <Box>
            {' '}
            <Button
              colorScheme={isActivate ? 'green' : 'red'}
              variant="outline"
              className="hover:cursor-pointer"
              onClick={handleActivate}
            >
              {isActivate ? t('row.activated') : t('row.inactivated')}
            </Button>
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  {isActivate ? t('row.inactivateRobotTitle') : t('row.activateRobotTitle')}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text>
                    {isActivate
                      ? t('row.inactivateRobotWarning')
                      : t('row.activateRobotWarning')}
                  </Text>
                </ModalBody>
                <ModalFooter>
                  <Button variant="outline" mr={3} onClick={onClose}>
                    {t('modal.cancel')}
                  </Button>
                  <Button
                    colorScheme={isActivate ? 'red' : 'teal'}
                    onClick={() => {
                      handleToggleActivateConnection.mutate({
                        connectionKey: connectionKey,
                        status: !isActivate,
                      });
                      onClose();
                    }}
                  >
                    {isActivate ? t('row.inactivate') : t('row.activate')}
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>
        ) : (
          <HStack spacing={2}>
            <Box>
              <IconButton
                bg="white"
                aria-label="Delete item"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onSelectedForRemove(data.provider, data.name);
                }}
                icon={<DeleteIcon color="#319795" />}
              />
            </Box>
            <Box>
              <IconButton
                bg="white"
                aria-label="View code"
                icon={<RepeatIcon color="#319795" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReconnect();
                }}
              />
            </Box>
          </HStack>
        )}
      </Td>
    </Tr>
  );
};

export default ConnectionRow;
