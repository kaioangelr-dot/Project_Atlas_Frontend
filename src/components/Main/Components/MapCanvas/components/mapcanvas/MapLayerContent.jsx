import { Group, Image as CanvasImage, Line, Path, Text, Transformer } from "react-konva";
import { useCallback, useEffect, useState } from "react";
import { getMapLabelStyle, getPinToolStyle, getSoftStrokeStyle } from "./mapCanvasToolStyles";

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

function MapLayerContent({
  layer,
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
}) {
  return (
    <>
      {layer.drawings.map((drawing) => (
        <Line key={drawing.id} points={drawing.points} {...getSoftStrokeStyle(drawing)} />
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
          {...getMapLabelStyle(label)}
          scaleX={label.scaleX || 1}
          scaleY={label.scaleY || 1}
          draggable={selectTool === "quill"}
          onDragStart={(event) => {
            if (selectTool !== "quill" || event.evt.button !== 0) {
              event.target.stopDrag();
              return;
            }
            setSelectedImage(null);
            setSelectedLabel({ id: label.id, layerId: layer.id });
            recordUndo();
          }}
          onDragEnd={(event) => {
            updateLayer(
              layer.id,
              (currentLayer) => ({
                ...currentLayer,
                labels: currentLayer.labels.map((currentLabel) =>
                  currentLabel.id === label.id
                    ? { ...currentLabel, x: event.target.x(), y: event.target.y() }
                    : currentLabel,
                ),
              }),
              false,
            );
          }}
          onClick={(event) => {
            if (event.evt.button !== 0) return;
            event.cancelBubble = true;
            onLabelClick(label, layer.id);
          }}
        />
      ))}

      {layer.pins.map((pin) => {
        const isHovered = hoveredPinId === pin.id;
        const pinStyle = getPinToolStyle({ isHovered, stageScale });

        return (
          <Group
            key={pin.id}
            x={pin.x}
            y={pin.y}
            scaleX={pinStyle.scale}
            scaleY={pinStyle.scale}
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
              fill={pinStyle.fill}
              strokeWidth={pinStyle.strokeWidth}
            />
          </Group>
        );
      })}

      {(selectedLabel?.layerId === layer.id || (selectedImage?.layerId === layer.id && selectTool === "image")) && (
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
    </>
  );
}

export default MapLayerContent;
