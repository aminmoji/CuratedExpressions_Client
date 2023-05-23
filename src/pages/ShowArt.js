import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function ShowArt(props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const artworks = props.artWorks;
  console.log(id);

  const artwork = artworks ? artworks.find((a) => a._id === id) : null;

  const loaded = () => {
    return (
      <>
        <h1>{artwork.title}</h1>
        <h2>{artwork.price}</h2>
        <img
          className="artwork-image"
          src={artwork.images}
          alt={artwork.title}
        />
        <h3>{artwork.medium}</h3>
      </>
    );
  };
  const loading = () => {
    return <h1>Loading ...</h1>;
  };

  return artwork ? loaded() : loading();
}
export default ShowArt;
