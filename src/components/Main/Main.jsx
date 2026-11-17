import MapCanvas from "./Components/MapCanvas/mapcanvas";
import Popup from "../Popup/Popup";
import editIcon from "../../images/edit.svg";

export default function Main(props) {
  const {
    mapTitle,
    isMapOwner,
    onSaveMap,
    onMapTitleChange,
    isSaving,
    onClose,
    onOpen,
    onSelectTool,
    onToggleLayers,
    isLayerPanelOpen,
    brushSize,
    brushSoftness,
    popup,
    selectTool,
    layers,
  } = props;
  return (
    <div className="main">
      <section className="main__map">
        <MapCanvas
          mapTitle={mapTitle}
          isMapOwner={isMapOwner}
          onSaveMap={onSaveMap}
          isSaving={isSaving}
          onOpen={onOpen}
          onSelectTool={onSelectTool}
          onToggleLayers={onToggleLayers}
          isLayerPanelOpen={isLayerPanelOpen}
          brushSize={brushSize}
          brushSoftness={brushSoftness}
          selectTool={selectTool}
          layers={layers}
        />
        <h1 className={`main__title ${isMapOwner ? "main__title_editable" : ""}`}>
          <input
            type="text"
            className="main__title-input"
            aria-label="Map title"
            spellCheck={false}
            disabled={!isMapOwner}
            value={mapTitle}
            size={Math.max(mapTitle.length, 1)}
            maxLength={60}
            onChange={(event) => onMapTitleChange(event.target.value)}
          />
          {isMapOwner && (
            <span className="main__title-edit-icon" aria-hidden="true">
              <img src={editIcon} alt="" />
            </span>
          )}
        </h1>
        {popup && (
          <Popup onClose={onClose} title={popup.title}>
            {popup.children}
          </Popup>
        )}
      </section>
    </div>
  );
}
