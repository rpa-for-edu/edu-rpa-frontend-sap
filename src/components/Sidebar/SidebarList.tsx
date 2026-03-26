import {
  Box,
  BoxProps,
  CloseButton,
  Divider,
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import SidebarItem from './SidebarItem';
import { IconType } from 'react-icons';
import { useSelector } from 'react-redux';
import { homeSelector } from '@/redux/selector';

interface LinkProps {
  path: string;
  name: string;
  icon: IconType;
}

export interface SidebarSection {
  label?: string;
  items: LinkProps[];
}

interface SidebarListProps extends BoxProps {
  data: LinkProps[];
  sections?: SidebarSection[];
  path: string;
  onClose: () => void;
}

const SidebarList = ({ onClose, data, sections, path, ...props }: SidebarListProps) => {
  const router = useRouter();
  const { isHiddenSidebar } = useSelector(homeSelector);
  const MAX_WIDTH = 250;
  const MIN_WIDTH = 81;
  const sideBarWidth = !isHiddenSidebar ? MAX_WIDTH : MIN_WIDTH;
  const isExpanded = sideBarWidth === MAX_WIDTH;

  const renderItems = (items: LinkProps[]) =>
    items.map((link: LinkProps) => {
      const activeStyle =
        link.path == path ? 'bg-[#4FD1C5] text-white' : '';
      return (
        <SidebarItem
          key={link.name}
          id={'sidebar-item-' + link.path.replace(/\//g, '-')}
          icon={link.icon}
          onClick={() => router.push(link.path)}
          className={activeStyle}>
          {isExpanded && (
            <p className="text-[14px] ">{link.name}</p>
          )}
        </SidebarItem>
      );
    });

  return (
    <Box
      bg="white"
      borderRight="1px"
      pos="fixed"
      top={{ base: 0, md: 20 }}
      transition="width 0.5s ease"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: sideBarWidth }}
      style={{ height: 'calc(100vh - 80px)' }}
      overflowY="auto"
      overflowX="hidden"
      overscrollBehavior="contain"
      css={{
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '4px' },
      }}
      {...props}>
      <Flex alignItems="center" justifyContent="center">
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>

      {sections && sections.length > 0 ? (
        <Box>
          {sections.map((section, idx) => (
            <Box key={section.label || `section-${idx}`}>
              {idx > 0 && section.label && (
                <Box px={3} pt={2} pb={0}>
                  <Divider borderColor="gray.300" />
                  {isExpanded && (
                    <Text
                      fontSize="11px"
                      fontWeight="bold"
                      color="gray.400"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      mt={1}
                      ml={2}
                    >
                      {section.label}
                    </Text>
                  )}
                </Box>
              )}
              {renderItems(section.items)}
            </Box>
          ))}
        </Box>
      ) : (
        <Box>
          {renderItems(data)}
        </Box>
      )}
    </Box>
  );
};
export default SidebarList;
