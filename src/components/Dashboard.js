import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";

function Dashboard() {
  const URL = "http://localhost:4000/user/";
  const [userArtworks, setUserArtworks] = useState(null);
  const userToken = localStorage.getItem("token");
  const data = userToken ? jwt_decode(userToken) : null;

  const getUserArtWorks = async () => {
    const id = data.user._id;
    const response = await fetch(URL + id);
    const works = await response.json();
    setUserArtworks(works);
  };

  useEffect(() => {
    getUserArtWorks();
  }, []);

  const loaded = () => {
    return userArtworks.map((artwork) => (
      <div key={artwork._id} className="artwork">
        <h1>{artwork.title}</h1>
        <img src={artwork.image} alt={artwork.title} />
        <h3>{artwork.medium}</h3>
      </div>
    ));
  };

  const loading = () => {
    return <h1>Loading...</h1>;
  };

  return userArtworks ? loaded() : loading();
}

export default Dashboard;
