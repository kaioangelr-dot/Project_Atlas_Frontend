export default function LayerPanel({
  layers,
  activeLayerId,
  isOpen,
  onAddLayer,
  onSelectLayer,
  onToggleVisibility,
  onDeleteLayer,
}) {
  if (!isOpen) return null;

  return (
    <section className="map-canvas__layers" aria-label="Layers">
      <div className="map-canvas__layers-header">
        <h2>Layers</h2>
        <button
          type="button"
          className="map-canvas__layers-add"
          title="Add layer"
          aria-label="Add layer"
          onClick={onAddLayer}
        >
          +
        </button>
      </div>
      <ul className="map-canvas__layer-list">
        {layers.map((layer) => (
          <li className="map-canvas__layer-item" key={layer.id}>
            <button
              type="button"
              className={`map-canvas__layer-select ${activeLayerId === layer.id ? "is-active" : ""}`}
              aria-pressed={activeLayerId === layer.id}
              onClick={() => onSelectLayer(layer.id)}
            >
              {layer.name}
            </button>
            <button
              type="button"
              className="map-canvas__layer-visibility"
              title={layer.visible ? "Hide layer" : "Show layer"}
              aria-label={`${layer.visible ? "Hide" : "Show"} ${layer.name}`}
              aria-pressed={layer.visible}
              onClick={() => onToggleVisibility(layer.id)}
            >
              {layer.visible ? "Visible" : "Hidden"}
            </button>
            {layers.length > 1 && (
              <button
                type="button"
                className="map-canvas__layer-delete"
                title={`Delete ${layer.name}`}
                aria-label={`Delete ${layer.name}`}
                onClick={() => onDeleteLayer(layer.id)}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
