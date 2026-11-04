import SaveMap from "../../../../../Popup/components/SaveMap/SaveMap";

export default function createSaveMapHandler({ onOpen, mapTitle, onSaveMap, isSaving, layersRef, stageRef }) {
  return () => {
    onOpen({
      title: "Save map",
      children: (
        <SaveMap
          title={mapTitle}
          layers={layersRef.current}
          stageRef={stageRef}
          onSave={onSaveMap}
          isSaving={isSaving}
        />
      ),
    });
  };
}
