import { useCallback, useEffect, useRef, useState } from "react";
import AddImage from "../../../../Popup/components/AddImage/AddImage";
import PinPopup from "../../../../Popup/components/PinPopup/PinPopup";

export default function useMapTools({
  selectTool,
  brushSize,
  brushSoftness,
  activeLayerId,
  layers,
  allocateId,
  updateLayer,
  getMapPosition,
  startPanning,
  onOpen,
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoveredPinId, setHoveredPinId] = useState(null);
  const [textEditor, setTextEditor] = useState(null);
  const [textDraft, setTextDraft] = useState("");
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageNodeVersion, setImageNodeVersion] = useState(0);
  const [previousSelectTool, setPreviousSelectTool] = useState(selectTool);

  const textInputRef = useRef(null);
  const textEditorActiveRef = useRef(false);
  const labelRefs = useRef({});
  const imageRefs = useRef({});
  const transformerRef = useRef(null);
  const activeDrawingRef = useRef(null);
  const wasDraggedRef = useRef(false);

  if (selectTool !== previousSelectTool) {
    setPreviousSelectTool(selectTool);
    if (selectTool !== "image") setSelectedImage(null);
  }

  useEffect(() => {
    if (!isDrawing) return undefined;

    const handleDrawingEnd = () => {
      activeDrawingRef.current = null;
      setIsDrawing(false);
    };

    window.addEventListener("mouseup", handleDrawingEnd);
    return () => window.removeEventListener("mouseup", handleDrawingEnd);
  }, [isDrawing]);

  useEffect(() => {
    if (!textEditor) return;
    textInputRef.current?.focus();
  }, [textEditor]);

  useEffect(() => {
    const transformer = transformerRef.current;
    const selectedNode = selectedLabel
      ? labelRefs.current[selectedLabel.id]
      : selectedImage && selectTool === "image"
        ? imageRefs.current[selectedImage.id]
        : null;

    transformer?.nodes(selectedNode ? [selectedNode] : []);
    transformer?.getLayer()?.batchDraw();
  }, [selectedImage, selectedLabel, selectTool, layers, imageNodeVersion]);

  const cancelDrawing = useCallback(() => {
    activeDrawingRef.current = null;
    setIsDrawing(false);
  }, []);

  const registerImageNode = useCallback((id, node) => {
    if (node) {
      imageRefs.current[id] = node;
    } else {
      delete imageRefs.current[id];
    }
  }, []);

  const notifyImageNodeReady = useCallback(() => {
    setImageNodeVersion((version) => version + 1);
  }, []);

  const handleStageMouseDown = (event) => {
    if (startPanning(event)) return;

    if (
      event.evt.button !== 0 ||
      (selectTool !== "pencil" && selectTool !== "eraser") ||
      event.target !== event.target.getStage()
    ) {
      return;
    }

    const position = getMapPosition(event.target.getStage());
    if (!position) return;

    const id = allocateId();
    activeDrawingRef.current = { id, layerId: activeLayerId };
    setIsDrawing(true);
    updateLayer(activeLayerId, (layer) => ({
      ...layer,
      drawings: [
        ...layer.drawings,
        {
          id,
          kind: selectTool === "eraser" ? "eraser" : "brush",
          size: brushSize,
          softness: brushSoftness,
          points: [position.x, position.y],
        },
      ],
    }));
  };

  const handleStageMouseMove = (event) => {
    const activeDrawing = activeDrawingRef.current;
    if (!activeDrawing) return;

    const position = getMapPosition(event.target.getStage());
    if (!position) return;

    updateLayer(
      activeDrawing.layerId,
      (layer) => ({
        ...layer,
        drawings: layer.drawings.map((drawing) =>
          drawing.id === activeDrawing.id
            ? { ...drawing, points: [...drawing.points, position.x, position.y] }
            : drawing,
        ),
      }),
      false,
    );
  };

  const handleStageMouseUp = () => {
    cancelDrawing();
  };

  const finishTextEditing = () => {
    if (!textEditorActiveRef.current) return;
    textEditorActiveRef.current = false;

    const text = textDraft.trim();
    if (text && textEditor) {
      const id = allocateId();
      updateLayer(textEditor.layerId, (layer) => ({
        ...layer,
        labels: [...layer.labels, { id, x: textEditor.x, y: textEditor.y, text, fontSize: 20, scaleX: 1, scaleY: 1 }],
      }));
      setSelectedLabel({ id, layerId: textEditor.layerId });
    }

    setTextEditor(null);
    setTextDraft("");
  };

  const cancelTextEditing = () => {
    textEditorActiveRef.current = false;
    setTextEditor(null);
    setTextDraft("");
  };

  const handleStageClick = (event) => {
    if (event.evt.button !== 0) return;

    const stage = event.target.getStage();
    if (event.target !== stage) return;

    const position = getMapPosition(stage);
    if (!position) return;

    if (selectTool === "quill") {
      setSelectedLabel(null);
      setSelectedImage(null);
      textEditorActiveRef.current = true;
      setTextDraft("");
      setTextEditor({ layerId: activeLayerId, x: position.x, y: position.y });
      return;
    }

    if (selectTool === "image") {
      setSelectedLabel(null);
      setSelectedImage(null);
      const placement = { layerId: activeLayerId, x: position.x, y: position.y };
      onOpen({
        title: "Add image to map",
        children: (
          <AddImage
            onSave={(image) => handleImageUrlSave(placement, image)}
          />
        ),
      });
      return;
    }

    if (selectTool !== "pin") return;
    setSelectedLabel(null);
    setSelectedImage(null);
    updateLayer(activeLayerId, (layer) => {
      if (layer.pins.some((pin) => pin.x === position.x && pin.y === position.y)) return layer;

      return {
        ...layer,
        pins: [
          ...layer.pins,
          {
            x: position.x,
            y: position.y,
            id: allocateId(),
            name: "",
            description: "",
            photo: "",
          },
        ],
      };
    });
  };

  const handleImageUrlSave = (placement, image) => {
    const maxDimension = 300;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const id = allocateId();
    const newImage = {
      id,
      name: "Map image",
      src: image.src,
      x: placement.x,
      y: placement.y,
      width: image.width * scale,
      height: image.height * scale,
    };

    updateLayer(placement.layerId, (layer) => ({ ...layer, images: [...layer.images, newImage] }));
    setSelectedLabel(null);
    setSelectedImage({ id, layerId: placement.layerId });
    onOpen(null);
  };

  const handlePinClick = (pin, layerId, event) => {
    if (event.evt.button !== 0 || wasDraggedRef.current) return;

    onOpen({
      title: "Location Details",
      children: <PinPopup pin={pin} onSave={(details) => handlePinDetailsSave(layerId, pin.id, details)} />,
    });
  };

  const handlePinDetailsSave = (layerId, pinId, details) => {
    updateLayer(layerId, (layer) => ({
      ...layer,
      pins: layer.pins.map((pin) => (pin.id === pinId ? { ...pin, ...details } : pin)),
    }));
    onOpen(null);
  };

  return {
    isDrawing,
    hoveredPinId,
    setHoveredPinId,
    textEditor,
    textDraft,
    setTextDraft,
    selectedLabel,
    setSelectedLabel,
    selectedImage,
    setSelectedImage,
    textInputRef,
    labelRefs,
    imageRefs,
    transformerRef,
    wasDraggedRef,
    cancelDrawing,
    registerImageNode,
    notifyImageNodeReady,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    handleStageClick,
    finishTextEditing,
    cancelTextEditing,
    handlePinClick,
  };
}
