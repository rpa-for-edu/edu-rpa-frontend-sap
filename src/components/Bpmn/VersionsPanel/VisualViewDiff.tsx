import React, { useEffect, useRef, useState } from "react";
import { Box, Text, Spinner, Center } from "@chakra-ui/react";
import { VersionChange } from "@/interfaces/version";

interface VisualViewDiffProps {
  currentXml: string;
  selectedXml?: string;
  changes: VersionChange[];
  showDiff?: boolean;
  onElementClick?: (elementId: string) => void;
}

// Custom overlay colors for different change types
const CHANGE_COLORS: Record<string, { fill: string; stroke: string }> = {
  added: { fill: "rgba(72, 187, 120, 0.3)", stroke: "#38A169" },
  changed: { fill: "rgba(237, 137, 54, 0.3)", stroke: "#DD6B20" },
  moved: { fill: "rgba(128, 90, 213, 0.3)", stroke: "#805AD5" },
  removed: { fill: "rgba(229, 62, 62, 0.3)", stroke: "#E53E3E" },
};

export default function VisualViewDiff({
  currentXml,
  selectedXml,
  changes,
  showDiff = true,
  onElementClick,
}: VisualViewDiffProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !currentXml) return;

    let viewer: any = null;

    const initViewer = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import bpmn-js to avoid SSR issues
        const { default: BpmnViewer } = await import(
          "bpmn-js/lib/NavigatedViewer"
        );

        // Clean up previous viewer
        if (viewerRef.current) {
          viewerRef.current.destroy();
        }

        // Create new viewer
        viewer = new BpmnViewer({
          container: containerRef.current,
        });

        viewerRef.current = viewer;

        await viewer.importXML(currentXml);

        // Fit viewport
        const canvas = viewer.get("canvas");
        canvas.zoom("fit-viewport");

        // Add overlays for changes only when showDiff is true
        if (showDiff && changes.length > 0) {
          highlightChanges(viewer, changes);
        }

        // Add click listener
        const eventBus = viewer.get("eventBus");
        eventBus.on("element.click", (event: any) => {
          const element = event.element;
          if (element && onElementClick) {
            onElementClick(element.id);
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to import BPMN XML:", err);
        setError("Failed to load BPMN diagram");
        setIsLoading(false);
      }
    };

    initViewer();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [currentXml, changes, showDiff]);

  const highlightChanges = (viewer: any, changes: VersionChange[]) => {
    try {
      const overlays = viewer.get("overlays");
      const elementRegistry = viewer.get("elementRegistry");
      const canvas = viewer.get("canvas");

      changes.forEach((change) => {
        const element = elementRegistry.get(change.elementId);
        if (!element) return;

        const colors = CHANGE_COLORS[change.changeType];
        if (!colors) return;

        // Add marker class
        canvas.addMarker(change.elementId, `diff-${change.changeType}`);

        // Add overlay with color
        const bounds =
          element.width && element.height
            ? {
                width: element.width,
                height: element.height,
              }
            : { width: 100, height: 80 };

        overlays.add(change.elementId, "diff-highlight", {
          position: { top: 0, left: 0 },
          html: `<div style="
            width: ${bounds.width}px;
            height: ${bounds.height}px;
            background-color: ${colors.fill};
            border: 2px solid ${colors.stroke};
            border-radius: 4px;
            pointer-events: none;
          "></div>`,
        });
      });
    } catch (err) {
      console.error("Failed to highlight changes:", err);
    }
  };

  if (error) {
    return (
      <Center h="100%" bg="gray.50">
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  // Show empty state if no XML provided
  if (!currentXml) {
    return (
      <Center h="100%" bg="gray.50">
        <Text color="gray.500">Select a version to view the diagram</Text>
      </Center>
    );
  }

  return (
    <Box h="100%" w="100%" position="relative" bg="gray.50">
      {isLoading && (
        <Center
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="whiteAlpha.800"
          zIndex={10}
        >
          <Spinner size="lg" color="teal.500" />
        </Center>
      )}
      <Box
        ref={containerRef}
        h="100%"
        w="100%"
        sx={{
          ".bjs-container": {
            height: "100% !important",
          },
          // Custom styles for diff markers
          ".diff-added .djs-visual > :first-of-type": {
            stroke: "#38A169 !important",
            strokeWidth: "2px !important",
          },
          ".diff-changed .djs-visual > :first-of-type": {
            stroke: "#DD6B20 !important",
            strokeWidth: "2px !important",
          },
          ".diff-moved .djs-visual > :first-of-type": {
            stroke: "#805AD5 !important",
            strokeWidth: "2px !important",
          },
          ".diff-removed .djs-visual > :first-of-type": {
            stroke: "#E53E3E !important",
            strokeWidth: "2px !important",
            strokeDasharray: "4 4 !important",
          },
        }}
      />
    </Box>
  );
}
