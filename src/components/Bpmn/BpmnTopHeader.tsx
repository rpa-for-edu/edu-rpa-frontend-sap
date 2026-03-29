import React, { useState } from 'react';
import {
  Box,
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
} from '@chakra-ui/react';
import { ChevronRightIcon, BellIcon, QuestionIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import NotificationMenu from '../Header/NotificationMenu';
import ProfileMenu from '../Header/ProfileMenu';
import ModelerTourGuide from '@/components/TourGuide/ModelerTourGuide';
import HeaderAIChatbot from '../Header/HeaderAIChatbot';

interface BpmnTopHeaderProps {
  processID: string;
  processName: string;
  modelerRef?: any;
}

export default function BpmnTopHeader({
  processID,
  processName,
  modelerRef,
}: BpmnTopHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation('studio');
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  // Extract context from URL
  const { workspaceId, teamId } = router.query;
  
  // Determine context type and links
  const getContextInfo = () => {
    const path = router.asPath;
    
    if (teamId && workspaceId) {
      // Team context
      return {
        type: 'team',
        homeLink: `/workspace/${workspaceId}/teams/${teamId}`,
        studioLink: `/workspace/${workspaceId}/teams/${teamId}/studio`,
        homeLabel: 'Team Dashboard',
        studioLabel: 'Team Studio',
      };
    } else if (workspaceId) {
      // Workspace context
      return {
        type: 'workspace',
        homeLink: `/workspace/${workspaceId}`,
        studioLink: `/workspace/${workspaceId}/studio`,
        homeLabel: 'Workspace',
        studioLabel: 'Workspace Studio',
      };
    } else {
      // User context (default)
      return {
        type: 'user',
        homeLink: '/home',
        studioLink: '/studio',
        homeLabel: t('navigation.homepage'),
        studioLabel: t('navigation.project'),
      };
    }
  };
  
  const contextInfo = getContextInfo();

  return (
    <>
      <Box
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      px={4}
     
    >
      <Flex justify="space-between" align="center">
        {/* Breadcrumbs */}
        <Breadcrumb
          spacing="8px"
          separator={<ChevronRightIcon color="gray.500" />}
        >
          <BreadcrumbItem>
          
            <BreadcrumbLink
              onClick={() => router.push(contextInfo.homeLink)}
              fontSize="sm"
              color="gray.600"
              _hover={{ color: 'teal.500' }}
              cursor="pointer"
            >
              {contextInfo.homeLabel}
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => router.push(contextInfo.studioLink)}
              fontSize="sm"
              color="gray.600"
              _hover={{ color: 'teal.500' }}
              cursor="pointer"
            >
              {contextInfo.studioLabel}
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink fontSize="sm" color="gray.900" fontWeight="medium">
              {processName || t('navigation.nameProject')}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Right Icons */}
        <Flex align="center" gap={4}>
           <HeaderAIChatbot />
          <NotificationMenu />

          <Tooltip label="Hướng dẫn sử dụng Modeler" placement="bottom">
            <IconButton
              id="modeler-tour-btn"
              aria-label={t('navigation.help')}
              icon={<QuestionIcon />}
              variant="ghost"
              size="sm"
              colorScheme="teal"
              onClick={() => setIsTourOpen(true)}
            />
          </Tooltip>

          <ProfileMenu />
        </Flex>
      </Flex>
    </Box>

    <ModelerTourGuide isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} modelerRef={modelerRef} />
    </>
  );
}

