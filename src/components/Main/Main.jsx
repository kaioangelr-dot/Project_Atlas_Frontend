export default function Main(props) {
  const { mapTitle } = props;
  return (
    <div className="main">
      <section className="main__map">
        <h1 className="main__title">{mapTitle}</h1>
        <div className="main__zoom">
          <button className="main__zoom-btn main__zoom-btn_plus"></button>
          <button className="main__zoom-btn main__zoom-btn_less"></button>
        </div>
      </section>
    </div>
  );
}
