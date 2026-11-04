import { useContext } from "react";
import { CurrentUserContext } from "../../../contexts/CurrentUserContext";

import ConfirmationPopup from "../../Popup/components/PopupWithConfirmation/PopupWithConfirmation";
import { Link } from "react-router-dom";

export default function Map(props) {
  const { title, link, likes, /* owner, isDefault, */ _id: mapId } = props.map;
  const { onOpenPopup, onClosePopup, onmapLike, onmapDelete } = props;

  const { currentUser } = useContext(CurrentUserContext);

  const currentUserId = String(currentUser._id);
  const isLiked = likes.some((user) => String(user) === currentUserId);

  const deleteConfirmation = {
    title: "Are you sure?",
    children: <ConfirmationPopup onDelete={handleDeleteClick} />,
  };

  const mapLikeButtonClassName = `map__like-button ${isLiked ? "map__like-button_is-active" : ""}`;

  function handleLikeClick() {
    onmapLike(isLiked, mapId);
  }

  function handleDeleteClick() {
    onmapDelete(props.map);
    onClosePopup();
  }

  return (
    <li className="map">
      <Link to={`/maps/${mapId}`}>
        <img className="map__image" src={link} alt={`map of ${title}`} />
      </Link>
      {/* {currentUserId === owner && ( */}
      <button
        aria-label="Delete map"
        className="map__delete-button"
        type="button"
        onClick={() => onOpenPopup(deleteConfirmation)}
      ></button>
      {/* )} */}
      <div className="map__description">
        <h2 className="map__title">{title}</h2>
        <span className="map__like-counter">{likes.length > 0 ? likes.length : ""}</span>
        <button
          aria-label="Like map"
          className={mapLikeButtonClassName}
          type="button"
          onClick={handleLikeClick}
        ></button>
      </div>
    </li>
  );
}
