import React, { useState } from "react";
import jwt_decode from "jwt-decode";

function CreateArt(props) {
  const userToken = localStorage.getItem("token");
  const data = userToken ? jwt_decode(userToken) : null;
  const [newForm, setNewForm] = useState({
    title: "",
    description: "",
    price: "",
    medium: "",
    qty: "",
    image: "",
    tags: "",
    user: data.user._id,
  });
  const handleChange = (event) => {
    setNewForm({ ...newForm, [event.target.name]: event.target.value });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    props.createArtworks(newForm);
    setNewForm({
      title: "",
      description: "",
      price: "",
      medium: "",
      qty: "",
      image: "",
      tags: "",
      user: data.user._id,
    });
    alert("Artwork Successfully Uploaded!");
    window.location.href = "/index";
  };

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newForm.title}
          name="title"
          placeholder="Title"
          onChange={handleChange}
        />
        <input
          type="text"
          value={newForm.description}
          name="description"
          placeholder="Description"
          onChange={handleChange}
        />
        <input
          type="number"
          value={newForm.price}
          name="price"
          placeholder="Price"
          onChange={handleChange}
        />
        <input
          type="text"
          value={newForm.medium}
          name="medium"
          placeholder="Medium"
          onChange={handleChange}
        />
        <input
          type="number"
          value={newForm.qty}
          name="qty"
          placeholder="Quantity"
          onChange={handleChange}
        />
        <input
          type="text"
          value={newForm.image}
          name="image"
          placeholder="Image URL"
          onChange={handleChange}
        />
        <input
          type="text"
          value={newForm.tags}
          name="tags"
          placeholder="Tags"
          onChange={handleChange}
        />
        <input type="submit" value="Upload Artwork" />
      </form>
    </section>
  );
}

export default CreateArt;
