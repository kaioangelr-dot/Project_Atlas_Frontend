import { useEffect, useRef, useState } from "react";
import { MAP_CANVAS_HEIGHT, MAP_CANVAS_WIDTH } from "../../../../../utils/mapCanvasConfig";

export default function useStageDisplay() {
  const viewportRef = useRef(null);
  const [stageDisplay, setStageDisplay] = useState({ scale: 1, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const viewport = viewportRef.current;
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

  return { viewportRef, stageDisplay };
}
