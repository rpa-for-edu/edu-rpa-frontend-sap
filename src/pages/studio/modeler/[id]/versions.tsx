import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Box, Flex, useToast, useDisclosure } from "@chakra-ui/react";
import dynamic from "next/dynamic";

import {
  VersionsHeader,
  ChangesPanel,
  VersionsHistoryPanel,
  CreateVersionModal,
} from "@/components/Bpmn/VersionsPanel";
import { Version, VersionChange } from "@/interfaces/version";
import versionApi from "@/apis/versionApi";
import { QUERY_KEY } from "@/constants/queryKey";
import LoadingIndicator from "@/components/LoadingIndicator/LoadingIndicator";
import processApi from "@/apis/processApi";

// Loading component for dynamic imports
const DynamicLoading = () => (
  <div
    style={{
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F7FAFC",
    }}
  >
    <div>Loading...</div>
  </div>
);

// Dynamic imports for components that use browser APIs
const CodeViewDiff = dynamic(
  () => import("@/components/Bpmn/VersionsPanel/CodeViewDiff"),
  {
    ssr: false,
    loading: DynamicLoading,
  }
);

const VisualViewDiff = dynamic(
  () => import("@/components/Bpmn/VersionsPanel/VisualViewDiff"),
  {
    ssr: false,
    loading: DynamicLoading,
  }
);

export default function VersionsPage() {
  const router = useRouter();
  const { id: processId, name: processName } = router.query;
  const toast = useToast();

  // State
  const [activeView, setActiveView] = useState<"visual" | "code">("visual");
  const [showChanges, setShowChanges] = useState(false);
  // Support 2 versions for comparison
  const [baseVersion, setBaseVersion] = useState<Version | null>(null);
  const [compareVersion, setCompareVersion] = useState<Version | null>(null);
  const [selectedChangeId, setSelectedChangeId] = useState<
    string | undefined
  >();

  // Modal state
  const {
    isOpen: isCreateModalOpen,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal,
  } = useDisclosure();

  // Fetch current process
  const { data: currentProcess, isLoading: isLoadingProcess } = useQuery({
    queryKey: [QUERY_KEY.PROCESS_DETAIL, processId],
    queryFn: () => processApi.getProcessByID(processId as string),
    enabled: !!processId,
  });

  // Fetch versions
  const {
    data: versionsData,
    isLoading: isLoadingVersions,
    refetch: refetchVersions,
  } = useQuery({
    queryKey: ["versions", processId],
    queryFn: () => versionApi.getAllVersions(processId as string),
    enabled: !!processId,
  });

  // Fetch comparison when both versions are selected
  const { data: compareResult } = useQuery({
    queryKey: [
      "version-compare",
      processId,
      baseVersion?.id,
      compareVersion?.id,
    ],
    queryFn: () =>
      versionApi.compareVersions(
        processId as string,
        baseVersion?.id || "",
        compareVersion?.id || ""
      ),
    enabled: !!baseVersion && !!compareVersion && showChanges,
  });

  // Auto-select first two versions when data loads
  useEffect(() => {
    if (versionsData?.versions && versionsData.versions.length > 0) {
      // Auto-select first version as base if not already selected
      if (!baseVersion) {
        setBaseVersion(versionsData.versions[0]);
      }
      // Auto-select second version as compare if available and showChanges is on
      if (!compareVersion && versionsData.versions.length > 1 && showChanges) {
        setCompareVersion(versionsData.versions[1]);
      }
    }
  }, [versionsData, showChanges]);

  // Create version mutation
  const createVersionMutation = useMutation({
    mutationFn: (data: { tag: string; description: string }) =>
      versionApi.createVersion(processId as string, data),
    onSuccess: () => {
      toast({
        title: "Version created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      onCloseCreateModal();
      refetchVersions();
    },
    onError: () => {
      toast({
        title: "Failed to create version",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    },
  });

  // Delete version mutation
  const deleteVersionMutation = useMutation({
    mutationFn: (versionId: string) =>
      versionApi.deleteVersion(processId as string, versionId),
    onSuccess: () => {
      toast({
        title: "Version deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      setBaseVersion(null);
      refetchVersions();
    },
  });

  // Restore version mutation
  const restoreVersionMutation = useMutation({
    mutationFn: (versionId: string) =>
      versionApi.restoreVersion(processId as string, versionId),
    onSuccess: () => {
      toast({
        title: "Version restored successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      refetchVersions();
    },
  });

  // Handlers
  const handleVersionSelect = (version: Version, isBaseVersion: boolean) => {
    if (isBaseVersion) {
      setBaseVersion(version);
      // If selecting a new base and it's the same as compare, clear compare
      if (compareVersion?.id === version.id) {
        setCompareVersion(null);
      }
    } else {
      setCompareVersion(version);
    }
  };

  // Handle showChanges toggle
  const handleShowChangesChange = (show: boolean) => {
    setShowChanges(show);
    if (!show) {
      // When disabling diff, clear compare version
      setCompareVersion(null);
    }
  };

  const handleChangeClick = (change: VersionChange) => {
    setSelectedChangeId(change.id);
    // Could also highlight element in visual view
  };

  const handleRestoreVersion = (version: Version) => {
    restoreVersionMutation.mutate(version.id);
  };

  // Get the version to display (for single view mode)
  const displayVersion = baseVersion;

  const handleDownloadVersion = async (version: Version) => {
    try {
      const blob = await versionApi.downloadVersion(
        processId as string,
        version.id
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${processName || "process"}-${version.tag}.bpmn`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Failed to download version",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleDeleteVersion = (version: Version) => {
    if (window.confirm("Are you sure you want to delete this version?")) {
      deleteVersionMutation.mutate(version.id);
      // Clear selection if deleted version was selected
      if (baseVersion?.id === version.id) {
        setBaseVersion(null);
      }
      if (compareVersion?.id === version.id) {
        setCompareVersion(null);
      }
    }
  };

  // Get changes for display
  const changes = useMemo(() => {
    return compareResult?.changes || [];
  }, [compareResult]);

  // Loading state
  if (isLoadingProcess || isLoadingVersions) {
    return <LoadingIndicator />;
  }

  const versions = versionsData?.versions || [];

  // Get current process XML as fallback
  const currentXml = currentProcess?.xml || "";

  // Determine XML to display based on mode
  // Use currentXml as fallback when no version is selected
  const baseXml = baseVersion?.xml || currentXml;
  const compareXml = compareVersion?.xml || "";

  // Check if we can show diff (both versions selected and showChanges enabled)
  const canShowDiff = showChanges && baseVersion && compareVersion;

  return (
    <Box h="100vh" display="flex" flexDirection="column" overflow="hidden">
      {/* Header */}
      <VersionsHeader
        processId={processId as string}
        processName={(processName as string) || "Untitled Process"}
        activeView={activeView}
        onViewChange={setActiveView}
        showChanges={showChanges}
        onShowChangesChange={handleShowChangesChange}
      />

      {/* Main Content */}
      <Flex flex={1} overflow="hidden">
        {/* Left Sidebar - Changes Panel (only show when diff mode is active) */}
        {canShowDiff && (
          <ChangesPanel
            changes={changes}
            onChangeClick={handleChangeClick}
            selectedChangeId={selectedChangeId}
          />
        )}

        {/* Center - Visual/Code View */}
        <Box flex={1} overflow="hidden" bg="gray.100">
          {activeView === "visual" ? (
            <VisualViewDiff
              currentXml={canShowDiff ? compareXml : baseXml || currentXml}
              selectedXml={canShowDiff ? baseXml : undefined}
              changes={canShowDiff ? changes : []}
              showDiff={!!canShowDiff}
              onElementClick={(elementId) => {
                const change = changes.find((c) => c.elementId === elementId);
                if (change) {
                  setSelectedChangeId(change.id);
                }
              }}
            />
          ) : (
            <CodeViewDiff
              originalXml={baseXml || currentXml}
              modifiedXml={canShowDiff ? compareXml : baseXml || currentXml}
              originalLabel={
                baseVersion ? `${baseVersion.tag} (Base)` : "Current Process"
              }
              modifiedLabel={
                canShowDiff && compareVersion
                  ? `${compareVersion.tag} (Compare)`
                  : "Single view"
              }
              showDiff={!!canShowDiff}
            />
          )}
        </Box>

        {/* Right Sidebar - Versions History */}
        <VersionsHistoryPanel
          versions={versions}
          baseVersionId={baseVersion?.id}
          compareVersionId={compareVersion?.id}
          onVersionSelect={handleVersionSelect}
          showChanges={showChanges}
          onRestoreVersion={handleRestoreVersion}
          onEditVersion={() => {
            toast({ title: "Edit feature coming soon", status: "info" });
          }}
          onDownloadVersion={handleDownloadVersion}
          onDeleteVersion={handleDeleteVersion}
        />
      </Flex>

      {/* Create Version Modal */}
      <CreateVersionModal
        isOpen={isCreateModalOpen}
        onClose={onCloseCreateModal}
        onCreateVersion={(data) => createVersionMutation.mutate(data)}
        lastVersionTag={versions[0]?.tag}
        isLoading={createVersionMutation.isPending}
      />
    </Box>
  );
}
