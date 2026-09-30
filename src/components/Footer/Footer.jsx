import githubIcon from "../../images/github-icon.svg";
import linkedinIcon from "../../images/linkedin-icon.svg";
import logo from "../../images/atla-logo.png";

export default function Footer() {
  return (
    <div className="footer">
      <div className="footer__content">
        <img src={logo} alt="Atlas logo" className="footer__logo" />

        <div className="footer__social">
          <h3 className="footer__social-heading">Social media</h3>
          <ul className="footer__list">
            <li className="footer__list-item">
              <a
                href="https://github.com/kaioangelr-dot"
                className="footer__social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={githubIcon} alt="Github icon" className="footer__social-icon" />
                Github
              </a>
            </li>
            <li className="footer__list-item">
              <a
                href="https://www.linkedin.com/in/kaio-angel-rocha-5a69832b3/"
                className="footer__social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={linkedinIcon} alt="LinkedIn icon" className="footer__social-icon" />
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="footer__copyright">&copy; 2026 Kaio Angel Rocha</p>
    </div>
  );
}
