import pin from "../../images/pin.svg";
import pencil from "../../images/pencil.svg";
import eraser from "../../images/eraser.svg";
import image from "../../images/image.svg";
import quill from "../../images/quill.png";

export default function Sidebar(props) {
  const {
    isOpen,
    handleArrowClick,
    handleSelectTool,
    onToggleLayers,
    isLayerPanelOpen,
    brushSize,
    onBrushSizeChange,
    brushSoftness,
    onBrushSoftnessChange,
    selectTool,
  } = props;
  return (
    <aside className="sidebar">
      <ul className={`sidebar__map-tools ${isOpen && "sidebar__map-tools_open"}`}>
        <li>
          <button
            type="button"
            className={`sidebar__tool ${selectTool === "pin" ? "sidebar__tool_active" : ""}`}
            aria-label="Add pin to map"
            title="Pin (P)"
            aria-keyshortcuts="P"
            aria-pressed={selectTool === "pin"}
            onClick={() => handleSelectTool("pin")}
          >
            <img className="sidebar__image" src={pin} alt="pin" />
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`sidebar__tool ${selectTool === "pencil" ? "sidebar__tool_active" : ""}`}
            aria-label="Draw on map"
            title="Pencil (B)"
            aria-keyshortcuts="B"
            aria-pressed={selectTool === "pencil"}
            onClick={() => handleSelectTool("pencil")}
          >
            <img className="sidebar__image" src={pencil} alt="pencil" />
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`sidebar__tool ${selectTool === "eraser" ? "sidebar__tool_active" : ""}`}
            aria-label="Erase drawing"
            title="Eraser (E)"
            aria-keyshortcuts="E"
            aria-pressed={selectTool === "eraser"}
            onClick={() => handleSelectTool("eraser")}
          >
            <img className="sidebar__image sidebar__image_eraser" src={eraser} alt="eraser" />
          </button>
        </li>
        {(selectTool === "pencil" || selectTool === "eraser") && (
          <li className="sidebar__brush-size">
            <label htmlFor="brush-size">Size</label>
            <input
              id="brush-size"
              type="range"
              min="10"
              max="500"
              value={brushSize}
              onChange={(event) => onBrushSizeChange(Number(event.target.value))}
              aria-label="Brush and eraser size"
            />
            <output htmlFor="brush-size">{brushSize}px</output>
            <label htmlFor="brush-softness">Softness</label>
            <input
              id="brush-softness"
              type="range"
              min="0"
              max="100"
              value={brushSoftness}
              onChange={(event) => onBrushSoftnessChange(Number(event.target.value))}
              aria-label="Brush and eraser softness"
            />
            <output htmlFor="brush-softness">{brushSoftness}%</output>
          </li>
        )}
        <li>
          <button
            type="button"
            className={`sidebar__tool ${selectTool === "quill" ? "sidebar__tool_active" : ""}`}
            aria-label="Add text to map"
            title="Text (T)"
            aria-keyshortcuts="T"
            aria-pressed={selectTool === "quill"}
            onClick={() => handleSelectTool("quill")}
          >
            <img className="sidebar__image" src={quill} alt="quill" />
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`sidebar__tool ${selectTool === "image" ? "sidebar__tool_active" : ""}`}
            aria-label="Add image to map"
            title="Image (I)"
            aria-keyshortcuts="I"
            aria-pressed={selectTool === "image"}
            onClick={() => handleSelectTool("image")}
          >
            <img className="sidebar__image" src={image} alt="image" />
          </button>
        </li>
      </ul>
      <button
        className={`arrow sidebar__arrow ${!isOpen && "sidebar__arrow_closed"}`}
        onClick={() => handleArrowClick("sidebar")}
      ></button>
      <button
        type="button"
        className={`sidebar__layers-tab ${isLayerPanelOpen ? "sidebar__layers-tab_active" : ""}`}
        title="Layers (L)"
        aria-label="Open or close layers (L)"
        aria-keyshortcuts="L"
        aria-expanded={isLayerPanelOpen}
        onClick={() => onToggleLayers()}
      >
        Layers
      </button>
    </aside>
  );
}
