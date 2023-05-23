import React from "react";
import { Link } from "react-router-dom";
import jwt_decode from "jwt-decode";

function Header() {
  const userToken = localStorage.getItem("token");
  const data = userToken ? jwt_decode(userToken) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    // navigate("/", { replace: true });
    window.location.href = "/index";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light ml-3">
      <Link className="navbar-brand" to="/index">
        CuratedExpressions
      </Link>
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <Link className="nav-link" to="/index">
            Home
          </Link>
        </li>
        {data ? (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                Hello {data.user.firstname}!
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/create">
                Upload Artwork
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" onClick={handleLogout}>
                Logout
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/login">
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/signup">
                Signup
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Header;
