import atla from "../../images/atla-flying.png";

const Preloader = ({ isLoading }) => {
  return (
    <div className="preloader-container">
      <img className="preloader-image" src={atla} alt="dragon flying"></img>
      <p className="preloader-text">Loading...</p>
    </div>
  );
};

export default Preloader;
