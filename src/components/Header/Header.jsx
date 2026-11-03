import { useState } from "react";
import logo from "../../images/atla-head.svg";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header__background" aria-hidden="true" />
      <div className="header__content">
        <img className="header__logo" src={logo} alt="Atlas logo" />
        <div className="header__menu">
          <button
            type="button"
            className={`header__menu-toggle ${isMenuOpen ? "header__menu-toggle_is-open" : ""}`}
            aria-label="Open user menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span className="header__hamburger-line"></span>
            <span className="header__hamburger-line"></span>
            <span className="header__hamburger-line"></span>
          </button>

          {isMenuOpen && (
            <div className="header__menu-panel" role="menu" aria-label="user options">
              <p className="header__email">user@example.com</p>
              <button type="button" className="header__logout-btn">
                leave
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
