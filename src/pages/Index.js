import React, { useState } from "react";
import { Link } from "react-router-dom";

const Index = (props) => {
  const loaded = () => {
    return props.artWorks.map((artwork) => (
      <div key={artwork._id} className="artwork">
        <Link to={`/artworks/${artwork._id}`}>
          <h1>{artwork.name}</h1>
        </Link>
        <img src={artwork.image} alt={artwork.title} />
        <h3>{artwork.title}</h3>
        <h3>{artwork.price}</h3>
        <h3>{artwork.medium}</h3>
      </div>
    ));
  };

  const loading = () => {
    return <h1>Loading...</h1>;
  };

  return props.artWorks ? loaded() : loading();
};

export default Index;
