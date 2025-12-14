import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
import { Version } from "@/interfaces/version";
import {
  getVersionsGroupedByDate,
  formatVersionTime,
} from "@/mocks/versionMockData";
import {
  FiMoreVertical,
  FiRotateCcw,
  FiEdit2,
  FiDownload,
  FiTrash2,
} from "react-icons/fi";

interface VersionsHistoryPanelProps {
  versions: Version[];
  // Support selecting 2 versions for comparison
  baseVersionId?: string;
  compareVersionId?: string;
  onVersionSelect: (version: Version, isBaseVersion: boolean) => void;
  showChanges: boolean;
  onRestoreVersion?: (version: Version) => void;
  onEditVersion?: (version: Version) => void;
  onDownloadVersion?: (version: Version) => void;
  onDeleteVersion?: (version: Version) => void;
}

export default function VersionsHistoryPanel({
  versions,
  baseVersionId,
  compareVersionId,
  onVersionSelect,
  showChanges,
  onRestoreVersion,
  onEditVersion,
  onDownloadVersion,
  onDeleteVersion,
}: VersionsHistoryPanelProps) {
  const groupedVersions = getVersionsGroupedByDate(versions);

  const getSelectionState = (versionId: string) => {
    if (versionId === baseVersionId) return "base";
    if (versionId === compareVersionId) return "compare";
    return null;
  };

  const handleVersionClick = (version: Version) => {
    if (!showChanges) {
      // When showChanges is off, only select one version (base)
      onVersionSelect(version, true);
      return;
    }

    // When showChanges is on, allow selecting 2 versions
    const state = getSelectionState(version.id);

    if (state === "base") {
      // Clicking on base version - do nothing or could deselect
      return;
    } else if (state === "compare") {
      // Clicking on compare version - swap to base
      onVersionSelect(version, true);
    } else {
      // Clicking on unselected version
      if (!baseVersionId) {
        // No base selected - select as base
        onVersionSelect(version, true);
      } else if (!compareVersionId) {
        // Base selected, no compare - select as compare
        onVersionSelect(version, false);
      } else {
        // Both selected - replace compare
        onVersionSelect(version, false);
      }
    }
  };

  return (
    <Box
      w="280px"
      bg="white"
      borderLeft="1px solid"
      borderColor="gray.200"
      h="100%"
      overflowY="auto"
    >
      {/* Header */}
      <Box p={3} borderBottom="1px solid" borderColor="gray.200">
        <Text fontSize="sm" fontWeight="semibold" color="gray.800">
          Versions
        </Text>
      </Box>

      {/* Selection Guide */}
      {showChanges && (
        <Box
          px={3}
          py={2}
          bg="blue.50"
          borderBottom="1px solid"
          borderColor="blue.100"
        >
          <Text fontSize="xs" color="blue.600">
            {!baseVersionId
              ? "Click to select base version"
              : !compareVersionId
              ? "Click to select version to compare"
              : "Click on another version to change comparison"}
          </Text>
        </Box>
      )}

      {/* Current Label */}

      {/* Versions List */}
      <VStack spacing={0} align="stretch">
        {Object.entries(groupedVersions).map(
          ([date, dateVersions], groupIndex) => (
            <Box key={date}>
              {/* Date Separator */}
              {groupIndex > 0 && (
                <Box px={3} py={2} bg="gray.50">
                  <Text fontSize="xs" color="gray.500" fontWeight="medium">
                    {date}
                  </Text>
                </Box>
              )}

              {/* Versions for this date */}
              {dateVersions.map((version) => {
                const selectionState = getSelectionState(version.id);
                const isSelected = selectionState !== null;

                return (
                  <Box
                    key={version.id}
                    px={3}
                    py={3}
                    cursor="pointer"
                    bg={
                      selectionState === "base"
                        ? "red.50"
                        : selectionState === "compare"
                        ? "green.50"
                        : "transparent"
                    }
                    _hover={{
                      bg: isSelected
                        ? selectionState === "base"
                          ? "red.100"
                          : "green.100"
                        : "gray.50",
                    }}
                    onClick={() => handleVersionClick(version)}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    borderLeft={
                      isSelected
                        ? `3px solid ${
                            selectionState === "base" ? "#E53E3E" : "#38A169"
                          }`
                        : "3px solid transparent"
                    }
                    position="relative"
                  >
                    <HStack spacing={3} align="start">
                      {/* Avatar */}
                      <Avatar
                        size="sm"
                        name={version.createdBy.name}
                        bg="cyan.500"
                        color="white"
                        fontSize="xs"
                      />

                      {/* Version Info */}
                      <VStack spacing={0.5} align="start" flex={1}>
                        <HStack spacing={2}>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.800"
                          >
                            {version.tag}
                          </Text>
                          {showChanges && selectionState && (
                            <Badge
                              colorScheme={
                                selectionState === "base" ? "red" : "green"
                              }
                              fontSize="xs"
                              px={2}
                              borderRadius="full"
                            >
                              {selectionState === "base" ? "Base" : "Compare"}
                            </Badge>
                          )}
                          {!showChanges && isSelected && (
                            <Badge
                              colorScheme="blue"
                              fontSize="xs"
                              px={2}
                              borderRadius="full"
                            >
                              Selected
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          {formatVersionTime(version.createdAt)} - Created by{" "}
                          {version.createdBy.name}
                        </Text>
                        {version.description && (
                          <Text
                            fontSize="xs"
                            color="gray.600"
                            noOfLines={2}
                            mt={1}
                          >
                            {version.description}
                          </Text>
                        )}
                      </VStack>

                      {/* Actions Menu */}
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                          aria-label="Version options"
                          onClick={(e) => e.stopPropagation()}
                          _hover={{ bg: "gray.200" }}
                        />
                        <MenuList minW="160px" shadow="lg">
                          <MenuItem
                            icon={<FiRotateCcw />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestoreVersion?.(version);
                            }}
                            _hover={{
                              bg: "transparent",
                              outline: "2px solid",
                              outlineColor: "#5B5DD9",
                              outlineOffset: "-2px",
                            }}
                          >
                            Restore as latest
                          </MenuItem>
                          <MenuItem
                            icon={<FiEdit2 />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditVersion?.(version);
                            }}
                            _hover={{
                              bg: "transparent",
                              outline: "2px solid",
                              outlineColor: "#5B5DD9",
                              outlineOffset: "-2px",
                            }}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            icon={<FiDownload />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownloadVersion?.(version);
                            }}
                            _hover={{
                              bg: "transparent",
                              outline: "2px solid",
                              outlineColor: "#5B5DD9",
                              outlineOffset: "-2px",
                            }}
                          >
                            Download
                          </MenuItem>
                          <MenuItem
                            icon={<FiTrash2 />}
                            color="red.500"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteVersion?.(version);
                            }}
                            _hover={{
                              bg: "transparent",
                              outline: "2px solid",
                              outlineColor: "#5B5DD9",
                              outlineOffset: "-2px",
                            }}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>
                  </Box>
                );
              })}
            </Box>
          )
        )}
      </VStack>
    </Box>
  );
}
