export default function PinReadOnlyPopup({ pin }) {
  return (
    <div className="map-pin-popup map-pin-popup_read-only">
      {pin.photo && <img className="popup__photo-preview" src={pin.photo} alt={pin.name || "Location"} />}
      <h2 className="map-pin-popup__title">{pin.name || "Unnamed place"}</h2>
      {pin.description && <p className="map-pin-popup__description">{pin.description}</p>}
    </div>
  );
}
