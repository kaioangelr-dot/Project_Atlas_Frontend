import { useState } from "react";
import Preloader from "./Preloader/Preloader";
import Header from "./Header/Header";
import Navigation from "./Navigation/Navigation";
import Main from "./Main/Main";
import Sidebar from "./Sidebar/Sidebar";
import About from "./About/About";
import Footer from "./Footer/Footer";

function App() {
  const [mapTitle, setMapTitle] = useState("Map Name");
  return (
    <div className="app">
      {/* <Preloader /> */}
      <Header />
      <Navigation />
      <Main mapTitle={mapTitle} />
      <Sidebar />
      <About />
      <Footer />
    </div>
  );
}

export default App;
