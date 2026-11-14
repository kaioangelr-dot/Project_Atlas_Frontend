import { Link } from "react-router-dom";
import { useState } from "react";
import InfoToolTip from "../Popup/components/InfoToolTip/InfoToolTip";

export const Register = (props) => {
  const { popup, handleClosePopup, handleSignup, isSubmitting } = props;

  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const isRegisterDisabled =
    !data.email.trim() ||
    !data.password.trim() ||
    !data.confirmPassword.trim() ||
    data.password !== data.confirmPassword ||
    isSubmitting;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRegisterDisabled) return;

    handleSignup(data.email, data.password);
  };

  return (
    <main className="auth-page">
      <div className="auth-page__container register">
        <h1 className="auth-page__title">Create account</h1>
        <form
          className="auth-page__form register__form"
          id="register-form"
          onSubmit={handleSubmit}
        >
          <label className="auth-page__label" htmlFor="register-email">
            Email
          </label>
          <input
            className="auth-page__input register__input"
            id="register-email"
            name="email"
            type="email"
            placeholder="Email"
            maxLength="100"
            autoComplete="email"
            value={data.email}
            onChange={handleChange}
            required
          />
          <label className="auth-page__label" htmlFor="register-password">
            Password
          </label>
          <input
            className="auth-page__input register__input"
            id="register-password"
            name="password"
            type="password"
            placeholder="Password"
            minLength="8"
            maxLength="100"
            autoComplete="new-password"
            value={data.password}
            onChange={handleChange}
            required
          />
          <label className="auth-page__label" htmlFor="register-confirm-password">
            Confirm password
          </label>
          <input
            className="auth-page__input register__input"
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            minLength="8"
            maxLength="100"
            autoComplete="new-password"
            value={data.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            className="auth-page__button register__button"
            type="submit"
            disabled={isRegisterDisabled}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
        <div className="auth-page__switch register__signin">
          <p className="register__signin-text">
            Already a member?{" "}
            <Link to="/login" className="signin__link">
              Log in here!
            </Link>
          </p>
        </div>
      </div>
      {popup && (
        <InfoToolTip handleClosePopup={handleClosePopup}>
          {popup.children}
        </InfoToolTip>
      )}
    </main>
  );
};
