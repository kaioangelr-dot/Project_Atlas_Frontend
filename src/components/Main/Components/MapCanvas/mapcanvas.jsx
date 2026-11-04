import CanvasControls from "./components/mapcanvas/CanvasControls";
import createSaveMapHandler from "./components/mapcanvas/createSaveMapHandler";
import LayerPanel from "./components/mapcanvas/LayerPanel";
import MapStage from "./components/mapcanvas/MapStage";
import PinPreview from "./components/mapcanvas/PinPreview";
import TextEditor from "./components/mapcanvas/TextEditor";
import useMapCanvas from "./hooks/useMapCanvas";
import useStageDisplay from "./hooks/useStageDisplay";

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

  const { viewportRef: stageViewportRef, stageDisplay } = useStageDisplay();

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
  const handleOpenSaveDialog = createSaveMapHandler({
    onOpen,
    mapTitle,
    onSaveMap,
    isSaving,
    layersRef,
    stageRef,
  });

  return (
    <div className="map-canvas">
      <CanvasControls
        onSave={handleOpenSaveDialog}
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
