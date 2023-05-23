import React, { useState } from "react";
import storage from "../firebase";
import jwt_decode from "jwt-decode";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function CreateArt(props) {
  const userToken = localStorage.getItem("token");
  const data = userToken ? jwt_decode(userToken) : null;
  const [newForm, setNewForm] = useState({
    title: "",
    description: "",
    price: "",
    medium: "",
    qty: "",
    images: [],
    tags: "",
    user: data?.user?._id,
  });

  const handleChange = (event) => {
    if (event.target.name === "images") {
      const imageFiles = Array.from(event.target.files);
      setNewForm({ ...newForm, images: imageFiles });
    } else {
      setNewForm({ ...newForm, [event.target.name]: event.target.value });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const imageUrls = await uploadImages(newForm.images);
    console.log(imageUrls);
    const artworkData = { ...newForm, images: imageUrls };
    props.createArtworks(artworkData);
    setNewForm({
      title: "",
      description: "",
      price: "",
      medium: "",
      qty: "",
      images: [],
      tags: "",
      user: data?.user?._id,
    });
    // alert("Artwork Successfully Uploaded!");
    window.location.href = "/index";
  };

  const uploadImages = async (images) => {
    const imageUrls = [];
    for (const image of images) {
      const storageRef = ref(storage, `/images/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);
      const snapshot = await uploadTask;
      const url = await getDownloadURL(snapshot.ref);
      console.log(url);
      imageUrls.push(url);
    }
    return imageUrls;
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
        <input type="file" multiple name="images" onChange={handleChange} />
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
