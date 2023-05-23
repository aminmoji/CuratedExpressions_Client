import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";

function Dashboard() {
  const URL = "https://curatedexpressions.onrender.com/user/";
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
    return (
      <div className="container">
        <div className="row">
          <h3>My Artworks</h3>
        </div>
        <div className="row">
          {userArtworks.map((artwork) => (
            <div
              key={artwork._id}
              className="col-md-2 card index"
              style={{ width: "18rem" }}>
              <div className="card-body d-flex flex-column">
                <img
                  src={artwork.images}
                  className="card-img-top mb-auto"
                  alt={artwork.title}
                />
                <div className="mt-auto">
                  <h5 className="card-title">{artwork.title}</h5>
                  <p className="card-text">{artwork.price}</p>
                  <a href={`/edit/${artwork._id}`} className="btn btn-primary">
                    More Info
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const loading = () => {
    return <h1>Loading...</h1>;
  };

  return userArtworks ? loaded() : loading();
}

export default Dashboard;
