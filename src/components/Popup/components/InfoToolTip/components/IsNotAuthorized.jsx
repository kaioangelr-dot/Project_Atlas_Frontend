import { Link } from "react-router-dom";

export default function IsNotAuthorized({
  message,
  showLoginLink = false,
  handleClosePopup,
}) {
  return (
    <>
      <span className="popup__auth-icon popup__auth-icon_error" aria-hidden="true">
        !
      </span>
      <p className="popup__auth-text">{message || "Ops, algo deu errado. Tente novamente."}</p>
      {showLoginLink && (
        <Link
          to="/login"
          className="popup__login-link"
          onClick={handleClosePopup}
        >
          Entrar
        </Link>
      )}
    </>
  );
}
