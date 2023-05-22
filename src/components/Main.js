import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import jwt_decode from "jwt-decode";

import Index from "../pages/Index";
import ShowArt from "../pages/ShowArt";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Create from "./Create";

const Main = () => {
  const [artWorks, setArtWorks] = useState(null);

  const URL = "http://localhost:4000/";
  const URL_UPLOAD = "http://localhost:4000/artworks/";

  const getArtworks = async () => {
    const response = await fetch(URL);
    const data = await response.json();
    setArtWorks(data);
  };

  const createArtworks = async (artwork) => {
    await fetch(URL_UPLOAD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(artwork),
    });
  };

  const updateArtWorks = async (id) => {};

  useEffect(() => getArtworks, []);

  return (
    <Routes>
      <Route exact path="/index" element={<Index artWorks={artWorks} />} />
      <Route exact path="/signup" element={<Signup />} />
      <Route exact path="/login" element={<Login />} />
      <Route exact path="/dashboard" element={<Dashboard />} />
      <Route
        exact
        path="/create"
        element={<Create createArtworks={createArtworks} />}
      />
    </Routes>
  );
};

export default Main;
