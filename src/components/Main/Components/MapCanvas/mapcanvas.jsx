import { useEffect, useRef, useState } from "react";
import SaveMap from "../../../Popup/components/SaveMap/SaveMap";
import CanvasControls from "./components/mapcanvas/CanvasControls";
import LayerPanel from "./components/mapcanvas/LayerPanel";
import MapStage from "./components/mapcanvas/MapStage";
import PinPreview from "./components/mapcanvas/PinPreview";
import TextEditor from "./components/mapcanvas/TextEditor";
import useMapCanvas from "./hooks/useMapCanvas";
import { MAP_CANVAS_HEIGHT, MAP_CANVAS_WIDTH } from "../../../../utils/mapCanvasConfig";

export default function MapCanvas(props) {
  const {
    mapTitle,
    onSaveMap,
    isSaving,
    onOpen,
    isLayerPanelOpen,
    selectTool,
    layers: initialLayers,
  } = props;

  const stageViewportRef = useRef(null);
  const [stageDisplay, setStageDisplay] = useState({ scale: 1, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const viewport = stageViewportRef.current;
    if (!viewport) return undefined;

    const updateDisplay = () => {
      const scale = Math.max(
        viewport.clientWidth / MAP_CANVAS_WIDTH,
        viewport.clientHeight / MAP_CANVAS_HEIGHT,
      );
      const displayScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
      setStageDisplay({
        scale: displayScale,
        offsetX: (viewport.clientWidth - MAP_CANVAS_WIDTH * displayScale) / 2,
        offsetY: (viewport.clientHeight - MAP_CANVAS_HEIGHT * displayScale) / 2,
      });
    };

    updateDisplay();
    const observer = new ResizeObserver(updateDisplay);
    observer.observe(viewport);
    window.addEventListener("resize", updateDisplay);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateDisplay);
    };
  }, []);

  const {
    layers,
    layersRef,
    activeLayerId,
    setActiveLayerId,
    canUndo,
    addLayer,
    deleteLayer,
    toggleLayerVisibility,
    zoom,
    textEditor,
    textDraft,
    setTextDraft,
    textInputRef,
    finishTextEditing,
    cancelTextEditing,
    stageScale,
    stagePos,
    isDrawing,
    stageRef,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    handleWheel,
    handleStageClick,
    handleLabelClick,
    registerImageNode,
    notifyImageNodeReady,
    labelRefs,
    imageRefs,
    transformerRef,
    hoveredPinId,
    setHoveredPinId,
    selectedLabel,
    selectedImage,
    setSelectedLabel,
    setSelectedImage,
    updateLayer,
    recordUndo,
    wasDraggedRef,
    handlePinClick,
    handleUndo,
  } = useMapCanvas({ ...props, initialLayers, displayScale: stageDisplay.scale });

  return (
    <div className="map-canvas">
      <CanvasControls
        onSave={() =>
          onOpen({
            title: "Save map",
            children: (
              <SaveMap
                title={mapTitle}
                layers={layersRef.current}
                stageRef={stageRef}
                onSave={onSaveMap}
                isSaving={isSaving}
              />
            ),
          })
        }
        onUndo={handleUndo}
        canUndo={canUndo}
        onZoom={zoom}
      />

      <LayerPanel
        layers={layers}
        activeLayerId={activeLayerId}
        isOpen={isLayerPanelOpen}
        onAddLayer={addLayer}
        onSelectLayer={setActiveLayerId}
        onToggleVisibility={toggleLayerVisibility}
        onDeleteLayer={deleteLayer}
      />

      <TextEditor
        editor={textEditor}
        draft={textDraft}
        inputRef={textInputRef}
        stageScale={stageScale}
        stagePos={stagePos}
        displayScale={stageDisplay.scale}
        displayOffsetX={stageDisplay.offsetX}
        displayOffsetY={stageDisplay.offsetY}
        onDraftChange={setTextDraft}
        onFinish={finishTextEditing}
        onCancel={cancelTextEditing}
      />

      <div className="map-canvas__stage-viewport" ref={stageViewportRef}>
        <MapStage
          layers={layers}
          selectTool={selectTool}
          stageScale={stageScale}
          stagePos={stagePos}
          displayScale={stageDisplay.scale}
          isDrawing={isDrawing}
          stageRef={stageRef}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onWheel={handleWheel}
          onClick={handleStageClick}
          registerImageNode={registerImageNode}
          notifyImageNodeReady={notifyImageNodeReady}
          labelRefs={labelRefs}
          imageRefs={imageRefs}
          transformerRef={transformerRef}
          hoveredPinId={hoveredPinId}
          setHoveredPinId={setHoveredPinId}
          selectedLabel={selectedLabel}
          selectedImage={selectedImage}
          onLabelClick={handleLabelClick}
          setSelectedLabel={setSelectedLabel}
          setSelectedImage={setSelectedImage}
          updateLayer={updateLayer}
          recordUndo={recordUndo}
          wasDraggedRef={wasDraggedRef}
          onPinClick={handlePinClick}
        />
      </div>
      <PinPreview
        layers={layers}
        hoveredPinId={hoveredPinId}
        stageScale={stageScale}
        stagePos={stagePos}
        displayScale={stageDisplay.scale}
        displayOffsetX={stageDisplay.offsetX}
        displayOffsetY={stageDisplay.offsetY}
      />
    </div>
  );
}
