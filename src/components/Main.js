import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Index from "../pages/Index";
import ShowArt from "../pages/ShowArt";

const Main = (props) => {
  const [artWorks, setArtWorks] = useState(null);
  const URL = "http://localhost:4000/";

  const getArtworks = async () => {
    const response = await fetch(URL);
    const data = await response.json();
    setArtWorks(data);
  };

  const createArtworks = async (artwork) => {
    await fetch(URL, {
      method: "POST",
      header: {
        "Content-Type": "Application/json",
      },
      body: JSON.stringify(artwork),
    });
  };

  const updateArtWorks = async (id) => {};

  useEffect(() => getArtworks, []);

  return (
    <Routes>
      <Route exact path="/" element={<Index artWorks={artWorks} />} />
    </Routes>
  );
};

export default Main;
