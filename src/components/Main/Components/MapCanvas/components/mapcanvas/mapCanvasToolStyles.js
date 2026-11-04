const BRUSH_COLOR = "#00674F";
const ERASER_COLOR = "#000";
const LABEL_COLOR = "#000";
const PIN_WIDTH = 38;
const PIN_MAX_WIDTH = 48;
const PIN_HOVER_SCALE = 1.12;

export function getSoftStrokeStyle(drawing) {
  const softness = Math.min(100, Math.max(0, drawing.softness ?? 0)) / 100;
  const color = drawing.kind === "eraser" ? ERASER_COLOR : BRUSH_COLOR;

  return {
    stroke: color,
    strokeWidth: drawing.size,
    shadowColor: color,
    shadowBlur: softness * drawing.size * 0.3,
    shadowOpacity: softness,
    lineCap: "round",
    lineJoin: "round",
    tension: 0.35,
    globalCompositeOperation: drawing.kind === "eraser" ? "destination-out" : "source-over",
    listening: false,
  };
}

export function getMapLabelStyle(label) {
  return {
    fontSize: label.fontSize || 20,
    fill: LABEL_COLOR,
    fontFamily: "Inter",
    fontStyle: "normal",
    letterSpacing: 1,
  };
}

export function getTextEditorToolStyle({ editor, stageScale, displayScale }) {
  return {
    fontSize: `${(editor.fontSize || 15) * stageScale * displayScale}px`,
    letterSpacing: `${stageScale * displayScale}px`,
  };
}

export function getPinToolStyle({ isHovered, stageScale }) {
  return {
    scale: Math.min(isHovered ? PIN_HOVER_SCALE : 1, PIN_MAX_WIDTH / PIN_WIDTH) / stageScale,
    fill: isHovered ? "#b81426" : "#e61f35",
    strokeWidth: 2,
  };
}
