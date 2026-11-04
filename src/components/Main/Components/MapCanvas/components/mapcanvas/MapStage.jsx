import { Layer, Stage } from "react-konva";
import { MAP_CANVAS_HEIGHT, MAP_CANVAS_WIDTH } from "../../../../../../utils/mapCanvasConfig";
import MapLayerContent from "./MapLayerContent";

export default function MapStage({
  layers,
  selectTool,
  stageScale,
  stagePos,
  displayScale,
  isDrawing,
  stageRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onClick,
  registerImageNode,
  notifyImageNodeReady,
  labelRefs,
  imageRefs,
  transformerRef,
  hoveredPinId,
  setHoveredPinId,
  selectedLabel,
  selectedImage,
  onLabelClick,
  setSelectedLabel,
  setSelectedImage,
  updateLayer,
  recordUndo,
  wasDraggedRef,
  onPinClick,
}) {
  const layerContentProps = {
    selectTool,
    stageScale,
    registerImageNode,
    notifyImageNodeReady,
    labelRefs,
    imageRefs,
    transformerRef,
    hoveredPinId,
    setHoveredPinId,
    selectedLabel,
    selectedImage,
    onLabelClick,
    setSelectedLabel,
    setSelectedImage,
    updateLayer,
    recordUndo,
    wasDraggedRef,
    onPinClick,
  };

  return (
    <Stage
      className="map-canvas__stage"
      width={MAP_CANVAS_WIDTH}
      height={MAP_CANVAS_HEIGHT}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stagePos.x}
      y={stagePos.y}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
      onClick={onClick}
      ref={stageRef}
      style={{
        left: "50%",
        top: "50%",
        position: "absolute",
        transform: `translate(-50%, -50%) scale(${displayScale})`,
        transformOrigin: "center center",
        pointerEvents: "auto",
        cursor:
          selectTool === "eraser"
            ? "cell"
            : isDrawing || selectTool === "pencil" || selectTool === "image"
              ? "crosshair"
              : "default",
      }}
    >
      {layers.map((layer) => (
        <Layer key={layer.id} visible={layer.visible}>
          <MapLayerContent layer={layer} {...layerContentProps} />
        </Layer>
      ))}
    </Stage>
  );
}
