import author from "../../images/atla-head.svg";

export default function About() {
  return (
    <div className="about">
      <img className="about__image" src={author} alt="Author picture" />
      <h2 className="about__title">About the author</h2>
      <p className="about__text">Kaio Angel Rocha Alves, Full-stack developer born 2004, Minas Gerais, Brasil.</p>
    </div>
  );
}
