import { Link } from "react-router-dom";

export default function IsAuthorized(props) {
  const { handleClosePopup } = props;
  return (
    <>
      <span className="popup__auth-icon popup__auth-icon_success" aria-hidden="true">
        &#10003;
      </span>
      <p className="popup__auth-text">Você foi registrado com sucesso!</p>
      <Link to="/login" className="popup__login-link" onClick={handleClosePopup}>
        Fazer login
      </Link>
    </>
  );
}
