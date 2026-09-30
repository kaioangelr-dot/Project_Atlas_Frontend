import logo from "../../images/atla-head.svg";

export default function Header() {
  return (
    <div className="header">
      <img className="header__logo" src={logo} />
      <button className="header__logout-btn">leave</button>
    </div>
  );
}
