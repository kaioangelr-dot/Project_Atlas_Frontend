export default function TextEditor({
  editor,
  draft,
  inputRef,
  stageScale,
  stagePos,
  displayScale,
  displayOffsetX,
  displayOffsetY,
  onDraftChange,
  onFinish,
  onCancel,
}) {
  if (!editor) return null;

  return (
    <textarea
      ref={inputRef}
      className="map-canvas__text-editor"
      aria-label="Text to add to map"
      value={draft}
      onChange={(event) => onDraftChange(event.target.value)}
      onBlur={onFinish}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onCancel();
        } else if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          onFinish();
        }
      }}
      style={{
        left: `${displayOffsetX + (editor.x * stageScale + stagePos.x) * displayScale}px`,
        top: `${displayOffsetY + (editor.y * stageScale + stagePos.y) * displayScale}px`,
        fontFamily: "Inter, sans-serif",
        fontSize: `${(editor.fontSize || 15) * stageScale * displayScale}px`,
        fontWeight: 400,
        letterSpacing: `${stageScale * displayScale}px`,
      }}
    />
  );
}
