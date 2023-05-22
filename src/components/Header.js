import React from "react";
import { Link, useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

function Header() {
  const userToken = localStorage.getItem("token");
  const data = userToken ? jwt_decode(userToken) : null;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    // navigate("/", { replace: true });
    window.location.href = "/index";
  };

  return (
    <nav className="navbar">
      <ul>
        <Link to="/index">
          <li>Home</li>
        </Link>
        {data ? (
          <>
            <Link to="/dashboard">
              <li>Hello {data.user.lastname}</li>
            </Link>
            <Link to="/create">
              <li>Upload Artwork</li>
            </Link>
            <Link>
              <li onClick={handleLogout}>Logout</li>
            </Link>
          </>
        ) : (
          <>
            <Link to="/login">
              <li>Login</li>
            </Link>
            <Link to="/signup">
              <li>Signup</li>
            </Link>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Header;
