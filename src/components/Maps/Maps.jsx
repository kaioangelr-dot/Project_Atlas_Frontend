import Map from "./Map/Map";
import Popup from "../Popup/Popup";

export default function Maps(props) {
  const { maps } = props;
  const { handleOpenPopup, handleClosePopup, onmapLike, onmapDelete, popup } = props;
  return (
    <div className="maps">
      <ul className="maps__list">
        {maps.map((map) => (
          <Map
            key={map._id}
            map={map}
            onOpenPopup={handleOpenPopup}
            onmapLike={onmapLike}
            onmapDelete={onmapDelete}
            onClosePopup={handleClosePopup}
          />
        ))}
      </ul>
      {popup && (
        <Popup onClose={handleClosePopup} title={popup.title}>
          {popup.children}
        </Popup>
      )}
    </div>
  );
}
