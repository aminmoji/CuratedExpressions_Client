import React from "react";

const Index = (props) => {
  const loaded = () => {
    console.log("loaded");
    return (
      <div className="container">
        <div className="row">
          {props.artWorks.map((artwork) => (
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
                  <a href={`/show/${artwork._id}`} className="btn btn-primary">
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
    return <h1>Hello! The page is loading!</h1>;
  };

  return props.artWorks ? loaded() : loading();
};

export default Index;
