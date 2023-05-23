import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://curatedexpressions.onrender.com/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );
      const data = await response.json();
      if (data.user) {
        localStorage.setItem("token", data.user);
        alert("Login Successful!");
        window.location.href = "/index";
      } else {
        alert("Please Check your Username and Password");
      }
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <form>
        <input
          type="email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          placeholder="Email"
        />
        <input
          type="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          placeholder="Password"
        />
        <input type="submit" onClick={loginUser} />
      </form>
      <br />
      <p>OR</p>
      <br />
      <Link to="/signup">Sign Up Here</Link>
    </div>
  );
}

export default Login;
