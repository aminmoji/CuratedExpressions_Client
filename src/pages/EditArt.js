import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditArt(props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const artworks = props.artWorks;
  console.log(id);

  const artwork = artworks ? artworks.find((a) => a._id === id) : null;

  const [editForm, setEditForm] = useState(artwork);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (artwork) {
      setEditForm(artwork);
    }
  }, [artwork]);

  // handling form data change
  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  // handling submit event for edit form
  const handleUpdate = (e) => {
    e.preventDefault();
    props.updateArtWork(editForm, artwork._id);
    // navigate("/");
  };

  const handleEdit = () => {
    setIsEditing((prevState) => !prevState);
  };

  const handleDelete = () => {
    props.deleteArtWork(artwork._id);
    window.location.href = "/dashboard";
  };

  const loaded = () => {
    return (
      <div className="container">
        <h1>{artwork.title}</h1>
        <h2>{artwork.price}</h2>
        <img
          className="avatar-image"
          src={artwork.images}
          alt={artwork.title}
        />
        <h3>{artwork.medium}</h3>
        <h3>{artwork.qty}</h3>
        <h3>{artwork.description}</h3>
        <h3>{artwork.tags}</h3>
        <button onClick={handleEdit} className="btn btn-primary">
          {isEditing ? "Cancel Edit" : "Edit"}
        </button>
        <button onClick={handleDelete} className="btn btn-danger">
          Delete
        </button>
      </div>
    );
  };

  const loading = () => {
    return <h1>Loading ...</h1>;
  };

  return (
    <div className="artwork">
      {artwork ? loaded() : loading()}

      {isEditing && (
        <form onSubmit={handleUpdate} className="container">
          <input
            type="text"
            value={editForm.title}
            name="title"
            placeholder="Title"
            onChange={handleChange}
            className="form-control"
          />
          <input
            type="text"
            value={editForm.description}
            name="description"
            placeholder="Description"
            onChange={handleChange}
            className="form-control"
          />
          <input
            type="number"
            value={editForm.price}
            name="price"
            placeholder="Price"
            onChange={handleChange}
            className="form-control"
          />
          <input
            type="text"
            value={editForm.medium}
            name="medium"
            placeholder="Medium"
            onChange={handleChange}
            className="form-control"
          />
          <input
            type="number"
            value={editForm.qty}
            name="qty"
            placeholder="Quantity"
            onChange={handleChange}
            className="form-control"
          />
          <input
            type="file"
            multiple
            name="images"
            onChange={handleChange}
            className="form-control"
          />
          <input
            type="text"
            value={editForm.tags}
            name="tags"
            placeholder="Tags"
            onChange={handleChange}
            className="form-control"
          />
          <input
            type="submit"
            value="Update Artwork"
            className="btn btn-primary mt-3"
          />
        </form>
      )}
    </div>
  );
}

export default EditArt;
