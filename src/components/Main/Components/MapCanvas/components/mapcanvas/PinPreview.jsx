export default function PinPreview({
  layers,
  hoveredPinId,
  stageScale,
  stagePos,
  displayScale,
  displayOffsetX,
  displayOffsetY,
}) {
  if (hoveredPinId === null) return null;

  const layer = layers.find((item) => item.visible && item.pins.some((pin) => pin.id === hoveredPinId));
  const pin = layer?.pins.find((item) => item.id === hoveredPinId);
  if (!pin) return null;

  return (
    <div
      className="map-canvas__pin-preview"
      style={{
        left: `${displayOffsetX + (pin.x * stageScale + stagePos.x) * displayScale}px`,
        top: `${displayOffsetY + (pin.y * stageScale + stagePos.y) * displayScale}px`,
      }}
      aria-hidden="true"
    >
      {pin.photo ? (
        <img src={pin.photo} alt="" className="map-canvas__pin-preview-image" />
      ) : (
        <div className="map-canvas__pin-preview-placeholder" />
      )}
      <span className="map-canvas__pin-preview-title">{pin.name || "Unnamed place"}</span>
    </div>
  );
}
