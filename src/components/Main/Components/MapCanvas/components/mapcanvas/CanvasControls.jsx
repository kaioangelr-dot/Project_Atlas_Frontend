export default function CanvasControls({ onSave, onUndo, canUndo, onZoom }) {
  return (
    <>
      <div className="map-canvas__controls">
        <button type="button" className="map-canvas__control" onClick={onSave}>
          Save
        </button>
        <button
          type="button"
          className="map-canvas__control"
          title="Undo (Ctrl+Z)"
          aria-label="Undo last change (Ctrl+Z)"
          aria-keyshortcuts="Control+Z Meta+Z"
          onClick={onUndo}
          disabled={!canUndo}
        >
          Undo
        </button>
      </div>
      <div className="main__zoom">
        <button
          type="button"
          className="main__zoom-btn main__zoom-btn_plus"
          aria-label="Zoom in"
          title="Zoom in"
          onClick={() => onZoom(1.2)}
        />
        <button
          type="button"
          className="main__zoom-btn main__zoom-btn_less"
          aria-label="Zoom out"
          title="Zoom out"
          onClick={() => onZoom(1 / 1.2)}
        />
      </div>
    </>
  );
}
