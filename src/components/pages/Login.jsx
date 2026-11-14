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

  const isLoginDisabled = !data.email.trim() || !data.password.trim() || isSubmitting;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoginDisabled) return;
    handleSignin(data.email, data.password);
  };

  return (
    <main className="auth-page">
      <div className="auth-page__container login">
        <h1 className="auth-page__title">Sign in</h1>
        <form
          className="auth-page__form login__form"
          id="login-form"
          onSubmit={handleSubmit}
        >
          <label className="auth-page__label" htmlFor="login-email">
            Email
          </label>
          <input
            className="auth-page__input login__input"
            id="login-email"
            name="email"
            type="email"
            placeholder="Email"
            maxLength="100"
            autoComplete="email"
            value={data.email}
            onChange={handleChange}
            required
          />
          <label className="auth-page__label" htmlFor="login-password">
            Password
          </label>
          <input
            className="auth-page__input login__input"
            id="login-password"
            name="password"
            type="password"
            placeholder="Password"
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
            disabled={isLoginDisabled}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="auth-page__switch login__signup">
          <p className="login__signup-text">
            Not a member yet?{" "}
            <Link to="/signup" className="signup__link">
              Sign up here!
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
