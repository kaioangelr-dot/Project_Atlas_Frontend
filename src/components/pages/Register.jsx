import { Link } from "react-router-dom";
import { useState } from "react";
import InfoToolTip from "../Popup/components/InfoToolTip/InfoToolTip";

export const Register = (props) => {
  const { popup, handleClosePopup, handleSignup, isSubmitting } = props;

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
    handleSignup(data.email, data.password);
  };

  return (
    <main className="auth-page register">
      <h1 className="auth-page__title">Criar conta</h1>
      <form
        className="auth-page__form register__form"
        id="register-form"
        onSubmit={handleSubmit}
      >
        <label className="auth-page__label" htmlFor="register-email">
          E-mail
        </label>
        <input
          className="auth-page__input register__input"
          id="register-email"
          name="email"
          type="email"
          placeholder="E-mail"
          maxLength="100"
          autoComplete="email"
          value={data.email}
          onChange={handleChange}
          required
        />
        <label className="auth-page__label" htmlFor="register-password">
          Senha
        </label>
        <input
          className="auth-page__input register__input"
          id="register-password"
          name="password"
          type="password"
          placeholder="Senha"
          minLength="8"
          maxLength="100"
          autoComplete="new-password"
          value={data.password}
          onChange={handleChange}
          required
        />
        <button
          className="auth-page__button register__button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </button>
      </form>
      <div className="auth-page__switch register__signin">
        <p className="register__signin-text">
          Já é membro?{" "}
          <Link to="/login" className="signin__link">
            Faça o login aqui!
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
