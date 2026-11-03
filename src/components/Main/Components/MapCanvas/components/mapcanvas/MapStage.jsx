import { useCallback, useEffect, useState } from "react";
import { Group, Image as CanvasImage, Layer, Line, Path, Stage, Text, Transformer } from "react-konva";
import { MAP_CANVAS_HEIGHT, MAP_CANVAS_WIDTH } from "../../../../../../utils/mapCanvasConfig";

function MapImage({ image, nodeRef, onNodeReady, onSelect, onDragStart, onDragEnd, draggable, listening }) {
  const [loadedImage, setLoadedImage] = useState(null);
  const handleNodeRef = useCallback((node) => nodeRef(image.id, node), [image.id, nodeRef]);

  useEffect(() => {
    const element = new window.Image();
    element.onload = () => setLoadedImage(element);
    element.onerror = () => console.error(`Could not load map image ${image.name}.`);
    element.src = image.src;

    return () => {
      element.onload = null;
      element.onerror = null;
    };
  }, [image.name, image.src]);

  useEffect(() => {
    if (loadedImage) onNodeReady();
  }, [loadedImage, onNodeReady]);

  if (!loadedImage) return null;

  return (
    <CanvasImage
      ref={handleNodeRef}
      image={loadedImage}
      x={image.x}
      y={image.y}
      width={image.width}
      height={image.height}
      draggable={draggable}
      listening={listening}
      onClick={onSelect}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  );
}

function SoftStroke({ drawing, erasing, color }) {
  const softness = Math.min(100, Math.max(0, drawing.softness ?? 0)) / 100;
  const edgeBlur = softness * drawing.size * 0.3;

  return (
    <Line
      points={drawing.points}
      stroke={color}
      strokeWidth={drawing.size}
      shadowColor={color}
      shadowBlur={edgeBlur}
      shadowOpacity={softness}
      lineCap="round"
      lineJoin="round"
      tension={0.35}
      globalCompositeOperation={erasing ? "destination-out" : "source-over"}
      listening={false}
    />
  );
}

const PIN_WIDTH = 38;
const PIN_MAX_WIDTH = 48;
const PIN_HOVER_SCALE = 1.12;
const BRUSH_COLOR = "#00674F";

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
  setSelectedLabel,
  setSelectedImage,
  updateLayer,
  recordUndo,
  wasDraggedRef,
  onPinClick,
}) {
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
          {layer.drawings.map((drawing) => (
            <SoftStroke
              key={drawing.id}
              drawing={drawing}
              erasing={drawing.kind === "eraser"}
              color={drawing.kind === "eraser" ? "#000" : BRUSH_COLOR}
            />
          ))}

          {layer.images.map((image) => (
            <MapImage
              key={image.id}
              image={image}
              nodeRef={registerImageNode}
              onNodeReady={notifyImageNodeReady}
              draggable={selectTool === "image"}
              listening={selectTool === "image"}
              onSelect={(event) => {
                if (selectTool !== "image" || event.evt.button !== 0) return;
                event.cancelBubble = true;
                setSelectedLabel(null);
                setSelectedImage({ id: image.id, layerId: layer.id });
              }}
              onDragStart={(event) => {
                if (selectTool !== "image" || event.evt.button !== 0) {
                  event.target.stopDrag();
                  return;
                }
                recordUndo();
              }}
              onDragEnd={(event) => {
                updateLayer(
                  layer.id,
                  (currentLayer) => ({
                    ...currentLayer,
                    images: currentLayer.images.map((currentImage) =>
                      currentImage.id === image.id
                        ? { ...currentImage, x: event.target.x(), y: event.target.y() }
                        : currentImage,
                    ),
                  }),
                  false,
                );
              }}
            />
          ))}

          {layer.labels.map((label) => (
            <Text
              key={label.id}
              ref={(node) => {
                if (node) {
                  labelRefs.current[label.id] = node;
                } else {
                  delete labelRefs.current[label.id];
                }
              }}
              x={label.x}
              y={label.y}
              text={label.text}
              fontSize={label.fontSize || 20}
              scaleX={label.scaleX || 1}
              scaleY={label.scaleY || 1}
              fill="#222"
              stroke="#000"
              strokeWidth={3}
              lineJoin="round"
              onClick={(event) => {
                if (event.evt.button !== 0) return;
                event.cancelBubble = true;
                setSelectedImage(null);
                setSelectedLabel({ id: label.id, layerId: layer.id });
              }}
            />
          ))}

          {layer.pins.map((pin) => {
            const isHovered = hoveredPinId === pin.id;
            const pinScale = Math.min(isHovered ? PIN_HOVER_SCALE : 1, PIN_MAX_WIDTH / PIN_WIDTH) / stageScale;

            return (
              <Group
                key={pin.id}
                x={pin.x}
                y={pin.y}
                scaleX={pinScale}
                scaleY={pinScale}
                draggable
                onMouseDown={() => {
                  wasDraggedRef.current = false;
                }}
                onMouseEnter={(event) => {
                  setHoveredPinId(pin.id);
                  event.target.getStage().container().style.cursor = "pointer";
                }}
                onMouseLeave={(event) => {
                  setHoveredPinId(null);
                  event.target.getStage().container().style.cursor = "default";
                }}
                onClick={(event) => onPinClick(pin, layer.id, event)}
                onDragStart={(event) => {
                  if (event.evt.button !== 0) {
                    event.target.stopDrag();
                    return;
                  }
                  wasDraggedRef.current = true;
                  recordUndo();
                }}
                onDragEnd={(event) => {
                  updateLayer(
                    layer.id,
                    (currentLayer) => ({
                      ...currentLayer,
                      pins: currentLayer.pins.map((currentPin) =>
                        currentPin.id === pin.id
                          ? { ...currentPin, x: event.target.x(), y: event.target.y() }
                          : currentPin,
                      ),
                    }),
                    false,
                  );
                }}
              >
                <Path
                  x={-24}
                  y={-48}
                  data="M6 20 A18 18 0 1 1 42 20 C42 30 29 43 24 49 C19 43 6 30 6 20 Z M24 27 C27.866 27 31 23.866 31 20 C31 16.134 27.866 13 24 13 C20.134 13 17 16.134 17 20 C17 23.866 20.134 27 24 27 Z"
                  fillRule="evenodd"
                  fill={isHovered ? "#b81426" : "#e61f35"}
                  strokeWidth={2}
                />
              </Group>
            );
          })}

          {(selectedLabel?.layerId === layer.id ||
            (selectedImage?.layerId === layer.id && selectTool === "image")) && (
            <Transformer
              ref={transformerRef}
              keepRatio
              rotateEnabled={false}
              enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
              boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 || newBox.height < 20 ? oldBox : newBox)}
              onTransformEnd={() => {
                const selected = selectedLabel || selectedImage;
                const node = selectedLabel ? labelRefs.current[selectedLabel.id] : imageRefs.current[selectedImage.id];
                if (!node) return;

                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                if (selectedLabel) {
                  updateLayer(layer.id, (currentLayer) => ({
                    ...currentLayer,
                    labels: currentLayer.labels.map((label) =>
                      label.id === selected.id ? { ...label, scaleX, scaleY } : label,
                    ),
                  }));
                } else {
                  node.scaleX(1);
                  node.scaleY(1);
                  updateLayer(layer.id, (currentLayer) => ({
                    ...currentLayer,
                    images: currentLayer.images.map((currentImage) =>
                      currentImage.id === selected.id
                        ? { ...currentImage, width: node.width() * scaleX, height: node.height() * scaleY }
                        : currentImage,
                    ),
                  }));
                }
              }}
            />
          )}
        </Layer>
      ))}
    </Stage>
  );
}
