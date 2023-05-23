import React from "react";
import { useState, useEffect } from "react";

function Signup() {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [firstname, setFirstName] = useState(null);
  const [lastname, setLastName] = useState(null);
  const [website, setwebSite] = useState(null);
  const [phone, setPhone] = useState(null);

  const registerUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://curatedexpressions.onrender.com/signup/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            firstname,
            lastname,
            website,
            phone,
          }),
        }
      );
      const data = await response.json();
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="signup">
      <h1>Sign Up</h1>
      <form action="POST">
        <input
          type="text"
          onChange={(e) => {
            setFirstName(e.target.value);
          }}
          placeholder="First Name"
        />
        <input
          type="text"
          onChange={(e) => {
            setLastName(e.target.value);
          }}
          placeholder="Last Name"
        />
        <input
          type="email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          placeholder="Email"
        />
        <input
          type="tel"
          onChange={(e) => {
            setPhone(e.target.value);
          }}
          placeholder="Phone Number"
        />
        <input
          type="text"
          onChange={(e) => {
            setwebSite(e.target.value);
          }}
          placeholder="Website"
        />
        <input
          type="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          placeholder="Password"
        />
        <input type="submit" onClick={registerUser} placeholder="SignUp" />
      </form>
    </div>
  );
}

export default Signup;
