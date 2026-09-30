import pin from "../../images/pin.svg";
import pencil from "../../images/pencil.svg";
import move from "../../images/move.svg";
import image from "../../images/image.svg";
import arrow from "../../images/arrow.svg";
import quill from "../../images/quill.png";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <ul className="sidebar__map-tools">
        <li className="sidebar__tool">
          <img className="sidebar__image" src={pin} />
        </li>
        <li className="sidebar__tool">
          <img className="sidebar__image" src={quill} />
        </li>
        <li className="sidebar__tool">
          <img className="sidebar__image" src={pencil} />
        </li>
        <li className="sidebar__tool">
          <img className="sidebar__image" src={move} />
        </li>
        <li className="sidebar__tool">
          <img className="sidebar__image" src={image} />
        </li>
      </ul>
      <button className="arrow sidebar__arrow"></button>
    </aside>
  );
}
