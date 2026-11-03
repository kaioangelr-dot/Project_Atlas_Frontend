import { useEffect, useRef, useState } from "react";

const MIN_STAGE_SCALE = 0.25;
const MAX_STAGE_SCALE = 4;

export default function useMapViewport(displayScale) {
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const stageRef = useRef(null);
  const panStartRef = useRef(null);

  useEffect(() => {
    if (!isPanning) return undefined;

    const handleMouseMove = (event) => {
      const panStart = panStartRef.current;
      if (!panStart) return;

      setStagePos({
        x: panStart.stageX + (event.clientX - panStart.mouseX) / displayScale,
        y: panStart.stageY + (event.clientY - panStart.mouseY) / displayScale,
      });
    };

    const handleMouseUp = (event) => {
      if (event.button !== 1) return;
      panStartRef.current = null;
      setIsPanning(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [displayScale, isPanning]);

  const startPanning = (event) => {
    if (event.evt.button !== 1) return false;

    event.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return true;

    panStartRef.current = {
      mouseX: event.evt.clientX,
      mouseY: event.evt.clientY,
      stageX: stage.x(),
      stageY: stage.y(),
    };
    setIsPanning(true);
    return true;
  };

  const handleWheel = (event) => {
    event.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const oldScale = stage.scaleX();
    const scaleFactor = event.evt.deltaY < 0 ? 1.05 : 1 / 1.05;
    const newScale = Math.min(MAX_STAGE_SCALE, Math.max(MIN_STAGE_SCALE, oldScale * scaleFactor));
    const scaleRatio = newScale / oldScale;

    setStageScale(newScale);
    setStagePos({
      x: pointerPosition.x - (pointerPosition.x - stage.x()) * scaleRatio,
      y: pointerPosition.y - (pointerPosition.y - stage.y()) * scaleRatio,
    });
  };

  const zoom = (scaleFactor) => {
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const newScale = Math.min(MAX_STAGE_SCALE, Math.max(MIN_STAGE_SCALE, oldScale * scaleFactor));
    const scaleRatio = newScale / oldScale;
    const center = { x: stage.width() / 2, y: stage.height() / 2 };

    setStageScale(newScale);
    setStagePos({
      x: center.x - (center.x - stage.x()) * scaleRatio,
      y: center.y - (center.y - stage.y()) * scaleRatio,
    });
  };

  const getMapPosition = (stage) => {
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return null;

    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(pointerPosition);
  };

  return {
    stageRef,
    stageScale,
    stagePos,
    isPanning,
    startPanning,
    handleWheel,
    zoom,
    getMapPosition,
  };
}
