import { useCallback, useEffect } from "react";
import useMapLayers from "./useMapLayers";
import useMapTools from "./useMapTools";
import useMapViewport from "./useMapViewport";

export default function useMapCanvas({
  onOpen,
  onSelectTool,
  onToggleLayers,
  brushSize,
  brushSoftness,
  selectTool,
  initialLayers,
  displayScale,
}) {
  const mapLayers = useMapLayers(initialLayers);
  const viewport = useMapViewport(displayScale);
  const tools = useMapTools({
    selectTool,
    brushSize,
    brushSoftness,
    activeLayerId: mapLayers.activeLayerId,
    layers: mapLayers.layers,
    allocateId: mapLayers.allocateId,
    updateLayer: mapLayers.updateLayer,
    getMapPosition: viewport.getMapPosition,
    startPanning: viewport.startPanning,
    onOpen,
  });
  const { undo } = mapLayers;
  const { cancelDrawing } = tools;

  const handleUndo = useCallback(() => {
    cancelDrawing();
    undo();
  }, [cancelDrawing, undo]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.closest("input, textarea, select, [contenteditable='true']"))
      ) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        handleUndo();
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) return;

      switch (event.key.toLowerCase()) {
        case "p":
          onSelectTool("pin");
          break;
        case "b":
          onSelectTool("pencil");
          break;
        case "e":
          onSelectTool("eraser");
          break;
        case "t":
          onSelectTool("quill");
          break;
        case "i":
          onSelectTool("image");
          break;
        case "l":
          onToggleLayers();
          break;
        case "escape":
          onToggleLayers(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, onSelectTool, onToggleLayers]);

  return {
    ...mapLayers,
    ...viewport,
    ...tools,
    handleUndo,
  };
}
