import {
  Box,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
  Button,
} from '@chakra-ui/react';

import { FaHome, FaRobot, FaFileInvoice } from 'react-icons/fa';
import { RiFlowChart } from 'react-icons/ri';
import { IoIosRocket } from 'react-icons/io';
import { FaFile } from 'react-icons/fa6';
import {
  MdWorkspaces,
  MdGroups,
  MdPeople,
  MdDashboard,
  MdSettings,
} from 'react-icons/md';
import { usePathname } from 'next/navigation';
import Navbar from '../Header/Navbar';
import SidebarList, { SidebarSection } from './SidebarList';
import { useSelector, useDispatch } from 'react-redux';
import { homeSelector, userSelector } from '@/redux/selector';
import {
  setCurrentWorkspace,
  clearCurrentWorkspace,
} from '@/redux/slice/homeSlice';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';

interface Props {
  children?: React.ReactNode;
}

const Sidebar = ({ children }: Props) => {
  const { t } = useTranslation('sidebar');
  const { isOpen, onClose } = useDisclosure();
  const pathName = usePathname();
  const dispatch = useDispatch();
  const { isHiddenSidebar, currentWorkspaceId } = useSelector(homeSelector);
  const user = useSelector(userSelector);
  const sidebarWidth = isHiddenSidebar ? 81 : 250;
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const personalSidebarItems = [
    { path: '/home', name: t('home'), icon: FaHome },
    { path: '/robot/dashboard', name: t('dashboard') || 'Dashboard', icon: MdDashboard },
    { path: '/studio', name: t('studio'), icon: RiFlowChart },
    { path: '/robot', name: t('robot'), icon: FaRobot },
    {
      path: '/integration-service',
      name: t('integrationService'),
      icon: IoIosRocket,
    },
    { path: '/storage', name: t('storage'), icon: FaFile },
    {
      path: '/document-template',
      name: t('documentTemplate'),
      icon: FaFileInvoice,
    },
    { path: '/workspace', name: t('workspace'), icon: MdWorkspaces },
  ];

  const adminSidebarItems = [
    {
      path: '/admin/dashboard',
      name: t('adminDashboard') || 'Dashboard',
      icon: MdDashboard,
    },
    {
      path: '/admin/packages',
      name: t('packageManagement') || 'Package Management',
      icon: MdSettings,
    },
  ];

  // Clear workspace ID when navigating to personal routes
  useEffect(() => {
    if (!pathName?.startsWith('/workspace/') && currentWorkspaceId) {
      dispatch(clearCurrentWorkspace());
    }
  }, [pathName, dispatch, currentWorkspaceId]);

  // Build sections: personal items always shown; admin section only for admin role
  const sections: SidebarSection[] = useMemo(() => {
    const result: SidebarSection[] = [
      { items: personalSidebarItems },
    ];
    if (isAdmin) {
      result.push({
        label: t('adminSection') || 'Administration',
        items: adminSidebarItems,
      });
    }
    return result;
  }, [isAdmin, t]);

  // Flat list for backward compat (used as fallback)
  const sidebarItems = personalSidebarItems;

  return (
    <Box
      minH="100vh"
      bg={useColorModeValue('white', 'gray.900')}
      display="flex"
      overflow="hidden"
    >
      {/* Sidebar */}
      <SidebarList data={sidebarItems} sections={sections} path={pathName} onClose={onClose} />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarList data={sidebarItems} sections={sections} path={pathName} onClose={onClose} />
        </DrawerContent>
      </Drawer>

      <Box
        flex="1"
        overflowY="auto"
        overflowX="hidden"
        ml={{ base: 0, md: `${sidebarWidth}px` }}
        transition="margin-left 0.5s ease"
      >
        <Navbar />
        <Box flex="1" overflowY="auto" overflowX="hidden" pt="80px">
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
