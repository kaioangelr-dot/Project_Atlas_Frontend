import { Link } from "react-router-dom";

export default function Navigation(props) {
  const { isOpen, handleArrowClick } = props;

  return (
    <div className="navigation">
      <ul className={`navigation__list ${isOpen && "navigation__list_open"}`}>
        <Link to="/" className="navigation__options">
          New map
        </Link>
        <Link to="/maps" className="navigation__options">
          Maps
        </Link>
        <Link to="/about" className="navigation__options">
          About
        </Link>
      </ul>
      <button
        className={`arrow navigation__arrow ${!isOpen && "navigation__arrow_closed"}`}
        onClick={() => handleArrowClick("navigation")}
      ></button>
    </div>
  );
}
