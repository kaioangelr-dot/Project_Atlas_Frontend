import { useState } from "react";
import { loadImageFromUrl } from "../../../../utils/imageUrl";

export default function PinPopup({ pin, onSave }) {
  const [name, setName] = useState(pin.name || "");
  const [description, setDescription] = useState(pin.description || "");
  const [photo, setPhoto] = useState(pin.photo || "");
  const [photoError, setPhotoError] = useState("");
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const trimmedName = name.trim();
  const nameError =
    trimmedName.length === 0
      ? "Name is required."
      : trimmedName.length > 60
        ? "Name must be 60 characters or fewer."
        : "";
  const showNameError = (nameTouched || submitAttempted) && Boolean(nameError);
  const showPhotoRequiredError = submitAttempted && !photo && !photoError;
  const isSaveDisabled = Boolean(nameError) || isPhotoLoading || Boolean(photoError);

  const handlePhotoChange = (event) => {
    setPhoto(event.target.value);
    setPhotoError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (isSaveDisabled || !photo.trim()) return;

    setIsPhotoLoading(true);
    try {
      await loadImageFromUrl(photo);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setPhotoError(error.message);
      setIsPhotoLoading(false);
      return;
    }

    setIsPhotoLoading(false);

    onSave({
      name: trimmedName,
      description: description.trim(),
      photo: photo.trim(),
    });
  };

  return (
    <div className="map-pin-popup">
      <form className="popup__form" onSubmit={handleSubmit} noValidate>
        <label className="popup__field">
          <input
            autoFocus
            required
            maxLength={60}
            value={name}
            onBlur={() => setNameTouched(true)}
            onChange={(event) => setName(event.target.value)}
            placeholder="Place name"
            className={`popup__input ${showNameError ? "popup__input_type_error" : ""}`}
          />
          <span className={`popup__input-error ${showNameError ? "popup__input-error_active" : ""}`}>
            {showNameError ? nameError : ""}
          </span>
        </label>
        <label className="popup__field">
          <textarea
            rows={4}
            maxLength={500}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe this place"
            className="popup__input popup__textarea"
          />
        </label>
        <div className="popup__field">
          <input
            type="url"
            value={photo}
            aria-label="Photo URL"
            onChange={handlePhotoChange}
            placeholder="Photo URL (https://...)"
            className={`popup__input ${photoError ? "popup__input_type_error" : ""}`}
            disabled={isPhotoLoading}
          />
          <span className={`popup__input-error ${photoError ? "popup__input-error_active" : ""}`}>{photoError}</span>
          <span className={`popup__input-error ${showPhotoRequiredError ? "popup__input-error_active" : ""}`}>
            {showPhotoRequiredError ? "A photo is required." : ""}
          </span>
        </div>
        {photo && (
          <img
            className="popup__photo-preview"
            src={photo}
            alt="Location preview"
            onError={() => setPhotoError("Could not load an image from this URL.")}
          />
        )}
        <button className="popup__button" type="submit" disabled={isSaveDisabled}>
          {isPhotoLoading ? "Loading photo..." : "Save"}
        </button>
      </form>
    </div>
  );
}
