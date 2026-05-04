import React, { useState, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Box,
  HStack,
  Tag,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useToast,
} from '@chakra-ui/react';
import {
  DeleteIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  RepeatIcon,
} from '@chakra-ui/icons';
import ReactPaginate from 'react-paginate';
import { Connection } from '@/interfaces/connection';
import connectionApi from '@/apis/connectionApi';
import workspaceApi from '@/apis/workspaceApi';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import ConnectionRow from './ConnectionRow';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

interface ConnectionTableProps {
  header: string[];
  data: any;
  robotKey?: string;
  maxRows?: number;
  isLoading?: boolean;
  workspaceId?: string;
}

const ConnectionTable = (props: ConnectionTableProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedForRemove, setSelectedForRemove] = useState({
    provider: '',
    name: '',
  });
  const [connectionData, setConnectionData] = useState<Connection[]>(
    props.data
  );
  const itemsPerPage = props.maxRows || 5;
  const pageCount = Math.ceil(connectionData.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = connectionData.slice(startIndex, endIndex);
  const toast = useToast();
  const router = useRouter();
  const { t } = useTranslation('common');

  const { isOpen, onOpen, onClose } = useDisclosure();

  if (currentData.length == 0) return <Box></Box>;

  if (props.isLoading) {
    return <LoadingIndicator />;
  }

  const handlePageChange = (selected: any) => {
    setCurrentPage(selected.selected);
  };

  const handleNavigateServiceDetail = (
    connectionKey: string,
    provider: string,
    name: string
  ) => {
    router.push(
      `/integration-service/detail/${connectionKey}?provider=${provider}&user=${name}`
    );
  };

  const handleRemoveConnection = async (provider: string, name: string) => {
    try {
      if (props.workspaceId) {
        // Workspace connection: dùng workspace API
        await workspaceApi.deleteWorkspaceConnection(props.workspaceId, provider, name);
      } else {
        // User connection: dùng user API như cũ
        await connectionApi.removeConnection(provider, name);
      }
      toast({
        title: t('table.connection.removedSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setConnectionData(
        connectionData.filter(
          (item) => item.provider !== provider || item.name !== name
        )
      );
    } catch (error) {
      toast({
        title: t('table.connection.removedFailed'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSelectForRemove = (provider: string, name: string) => {
    setSelectedForRemove({ provider, name });
    onOpen();
  };

  return (
    <Box
      border="1px solid"
      borderColor="#319795"
      borderRadius="15px"
      overflow="hidden">
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              {props.header.map((item: string) => (
                <Th key={item}>{item}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map((item, index) => (
              <ConnectionRow
                key={index}
                data={item}
                robotKey={props.robotKey}
                workspaceId={props.workspaceId}
                onView={handleNavigateServiceDetail}
                onSelectedForRemove={handleSelectForRemove}
              />
            ))}
          </Tbody>
        </Table>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('table.connection.removeConfirmTitle')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{t('table.connection.removeConfirmMessage')}</Text>
            <Text fontWeight={'bold'}>
              {t('table.connection.provider')} {selectedForRemove.provider}, {t('table.connection.name')}{' '}
              {selectedForRemove.name}
            </Text>
            <Text>
              {t('table.connection.removeWarning')}
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              {t('buttons.cancel')}
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                handleRemoveConnection(
                  selectedForRemove.provider,
                  selectedForRemove.name
                );
                onClose();
              }}>
              {t('table.connection.removeButton')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ReactPaginate
        previousLabel={
          <IconButton aria-label="Previous">
            <ChevronLeftIcon />
          </IconButton>
        }
        nextLabel={
          <IconButton aria-label="Next">
            <ChevronRightIcon />
          </IconButton>
        }
        pageCount={pageCount}
        onPageChange={handlePageChange}
        containerClassName={'flex justify-end items-center m-4 gap-[5px]'}
        previousLinkClassName={'font-bold'}
        nextLinkClassName={'font-bold'}
        disabledClassName={'opacity-50 cursor-not-allowed'}
        activeClassName={'bg-primary rounded-[5px] text-white py-[8px]'}
        pageLinkClassName={
          'border rounded-[5px] px-[15px] py-[10px] hover:bg-primary hover:text-white'
        }
      />
    </Box>
  );
};

export default ConnectionTable;
