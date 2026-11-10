import { useState } from "react";
import logo from "../../images/atla-head.svg";
import { Link } from "react-router-dom";

export default function Header({ currentUser, onLogout }) {
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
              {currentUser ? (
                <>
                  <p className="header__email">{currentUser.email}</p>
                  <button
                    type="button"
                    className="header__logout-btn"
                    onClick={onLogout}
                  >
                    Sair
                  </button>
                </>
              ) : (
                <div className="header__auth-links">
                  <Link to="/login">Entrar</Link>
                  <Link to="/signup">Criar conta</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
