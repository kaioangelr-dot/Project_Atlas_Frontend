import { useState } from "react";
import { loadImageFromUrl } from "../../../../utils/imageUrl";

export default function AddImage({ onSave }) {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    let image;
    try {
      image = await loadImageFromUrl(imageUrl);
    } catch (loadError) {
      if (!(loadError instanceof Error)) throw loadError;
      setError(loadError.message);
      setIsLoading(false);
      return;
    }

    onSave({
      src: imageUrl.trim(),
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
  };

  return (
    <form className="popup__form" onSubmit={handleSubmit}>
      <label className="popup__field">
        <input
          type="url"
          required
          value={imageUrl}
          aria-label="Image URL"
          onChange={(event) => {
            setImageUrl(event.target.value);
            setError("");
          }}
          placeholder="Image URL (https://...)"
          className={`popup__input ${error ? "popup__input_type_error" : ""}`}
          disabled={isLoading}
        />
      </label>
      <span className={`popup__input-error ${error ? "popup__input-error_active" : ""}`}>
        {error}
      </span>
      <button className="popup__button" type="submit" disabled={isLoading}>
        {isLoading ? "Loading image..." : "Add image"}
      </button>
    </form>
  );
}
