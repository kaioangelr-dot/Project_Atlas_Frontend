import { useState } from "react";

export default function SaveMap({ title, layers, stageRef, onSave, isSaving }) {
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Map title is required.");
      return;
    }

    setError("");
    const stage = stageRef.current;
    if (!stage) {
      setError("The map canvas is not ready to save.");
      return;
    }

    const previousScale = { x: stage.scaleX(), y: stage.scaleY() };
    const previousPosition = stage.position();
    let previewImage;

    try {
      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 });
      stage.batchDraw();
      previewImage = stage.toDataURL({
        mimeType: "image/jpeg",
        quality: 0.8,
        pixelRatio: 0.5,
      });
    } catch {
      setError("Could not generate the map preview. An external image may not allow canvas export.");
      return;
    } finally {
      stage.scale(previousScale);
      stage.position(previousPosition);
      stage.batchDraw();
    }

    try {
      await onSave({ title: title.trim(), previewImage, layers });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    }
  };

  return (
    <form className="popup__form" onSubmit={handleSubmit}>
      <span className={`popup__input-error ${error ? "popup__input-error_active" : ""}`}>{error}</span>
      <button className="popup__button" type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save map"}
      </button>
    </form>
  );
}
