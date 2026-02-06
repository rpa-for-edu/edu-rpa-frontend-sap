import React from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  IconButton,
  Switch,
  Tabs,
  TabList,
  Tab,
  Button,
} from "@chakra-ui/react";
import { ChevronRightIcon, AddIcon } from "@chakra-ui/icons";
import { FiBell, FiHelpCircle, FiUser } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/router";

interface VersionsHeaderProps {
  processId: string;
  processName: string;
  activeView: "visual" | "code";
  onViewChange: (view: "visual" | "code") => void;
  showChanges: boolean;
  onShowChangesChange: (show: boolean) => void;
  onCreateVersion?: () => void;
}

export default function VersionsHeader({
  processId,
  processName,
  activeView,
  onViewChange,
  showChanges,
  onShowChangesChange,
  onCreateVersion,
}: VersionsHeaderProps) {
  const router = useRouter();
  
  // Extract context from URL
  const { workspaceId, teamId } = router.query;
  
  // Determine context type and links
  const getContextInfo = () => {
    if (teamId && workspaceId) {
      // Team context
      return {
        type: 'team',
        homeLink: `/workspace/${workspaceId}/teams/${teamId}`,
        studioLink: `/workspace/${workspaceId}/teams/${teamId}/studio`,
        modelerLink: `/workspace/${workspaceId}/teams/${teamId}/studio/modeler/${processId}`,
        homeLabel: 'Team Dashboard',
        studioLabel: 'Team Studio',
      };
    } else if (workspaceId) {
      // Workspace context
      return {
        type: 'workspace',
        homeLink: `/workspace/${workspaceId}`,
        studioLink: `/workspace/${workspaceId}/studio`,
        modelerLink: `/workspace/${workspaceId}/studio/modeler/${processId}`,
        homeLabel: 'Workspace',
        studioLabel: 'Workspace Studio',
      };
    } else {
      // User context (default)
      return {
        type: 'user',
        homeLink: '/home',
        studioLink: '/studio',
        modelerLink: `/studio/modeler/${processId}`,
        homeLabel: 'Homepage',
        studioLabel: 'Project',
      };
    }
  };
  
  const contextInfo = getContextInfo();

  return (
    <Box bg="white" borderBottom="1px solid" borderColor="gray.200">
      {/* Top Bar with Breadcrumb */}
      <Flex justify="space-between" align="center" px={4} py={3}>
        {/* Breadcrumb */}
        <Breadcrumb
          spacing={2}
          separator={<ChevronRightIcon color="gray.400" />}
          fontSize="sm"
        >
          <BreadcrumbItem>
            <BreadcrumbLink
              as={Link}
              href={contextInfo.homeLink}
              color="gray.600"
              _hover={{ color: "gray.800" }}
            >
              {contextInfo.homeLabel}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink
              as={Link}
              href={contextInfo.studioLink}
              color="gray.600"
              _hover={{ color: "gray.800" }}
            >
              {contextInfo.studioLabel}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink
              as={Link}
              href={contextInfo.modelerLink}
              color="gray.600"
              _hover={{ color: "gray.800" }}
            >
              {processName ? processName : processId}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <Text color="gray.800" fontWeight="medium">
              Versions
            </Text>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Right Icons */}
        <HStack spacing={2}>
          {/* Create Version Button */}
          <Button
            leftIcon={<AddIcon boxSize={3} />}
            size="sm"
            colorScheme="teal"
            variant="solid"
            onClick={onCreateVersion}
            fontWeight="medium"
          >
            Create version
          </Button>
          <IconButton
            aria-label="Notifications"
            icon={<FiBell />}
            variant="ghost"
            size="sm"
            color="gray.600"
          />
          <IconButton
            aria-label="Help"
            icon={<FiHelpCircle />}
            variant="ghost"
            size="sm"
            color="gray.600"
          />
          <IconButton
            aria-label="Profile"
            icon={<FiUser />}
            variant="ghost"
            size="sm"
            color="gray.600"
          />
        </HStack>
      </Flex>

      {/* Sub Header with Tabs and Toggle */}
      <Flex
        align="center"
        px={4}
        py={2}
        borderTop="1px solid"
        borderColor="gray.100"
        bg="gray.50"
      >
        {/* Tabs and Show Changes Toggle in same row */}
        <HStack spacing={6}>
          <Tabs
            index={activeView === "visual" ? 0 : 1}
            onChange={(index) => onViewChange(index === 0 ? "visual" : "code")}
            variant="unstyled"
            size="sm"
          >
            <TabList>
              <Tab
                fontWeight="medium"
                color="gray.600"
                pb={2}
                _selected={{
                  color: "gray.900",
                  borderBottom: "2px solid",
                  borderColor: "gray.900",
                }}
              >
                Visual view
              </Tab>
              <Tab
                fontWeight="medium"
                color="gray.600"
                pb={2}
                _selected={{
                  color: "gray.900",
                  borderBottom: "2px solid",
                  borderColor: "gray.900",
                }}
              >
                Code view
              </Tab>
            </TabList>
          </Tabs>

          {/* Show Changes Toggle - Right after Code view */}
          <HStack spacing={2}>
            <Switch
              colorScheme="teal"
              isChecked={showChanges}
              onChange={(e) => onShowChangesChange(e.target.checked)}
              size="md"
            />
            <Text fontSize="sm" color="gray.700">
              Show changes
            </Text>
          </HStack>
        </HStack>
      </Flex>
    </Box>
  );
}

