import { Link } from "react-router-dom";
import { useState } from "react";
import InfoToolTip from "../Popup/components/InfoToolTip/InfoToolTip";

export const Login = (props) => {
  const { popup, handleClosePopup, handleSignin, isSubmitting } = props;

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSignin(data.email, data.password);
  };

  return (
    <main className="auth-page login">
      <h1 className="auth-page__title">Entrar</h1>
      <form
        className="auth-page__form login__form"
        id="login-form"
        onSubmit={handleSubmit}
      >
        <label className="auth-page__label" htmlFor="login-email">
          E-mail
        </label>
        <input
          className="auth-page__input login__input"
          id="login-email"
          name="email"
          type="email"
          placeholder="E-mail"
          maxLength="100"
          autoComplete="email"
          value={data.email}
          onChange={handleChange}
          required
        />
        <label className="auth-page__label" htmlFor="login-password">
          Senha
        </label>
        <input
          className="auth-page__input login__input"
          id="login-password"
          name="password"
          type="password"
          placeholder="Senha"
          minLength="8"
          maxLength="100"
          autoComplete="current-password"
          value={data.password}
          onChange={handleChange}
          required
        />
        <button
          className="auth-page__button login__button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="auth-page__switch login__signup">
        <p className="login__signup-text">
          Ainda não é membro?{" "}
          <Link to="/signup" className="signup__link">
            Inscreva-se aqui!
          </Link>
        </p>
      </div>
      {popup && (
        <InfoToolTip handleClosePopup={handleClosePopup}>
          {popup.children}
        </InfoToolTip>
      )}
    </main>
  );
};
