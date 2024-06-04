import React, { useCallback, useEffect, useState } from "react";
import "./Header.css"; // Import the CSS file
import Logo from "../../Assets/Logo/TVS-Motor-Company.png";
import avatarImage from "../../Assets/Image-60.png"; // Import your avatar image
import { useNavigate } from "react-router-dom";
import { decryptData } from "../../Utils/cryptoUtils";

const Header = () => {
  const [username, setusername] = useState();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleAvatarClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Clear local storage and perform logout actions
    localStorage.clear();
    navigate("/");

    // You may want to redirect the user to the login page or perform other logout actions here
  };

  const checkLoginStatus = useCallback(async () => {
    const data = await localStorage.getItem("TVS_Cache_Data");
    if (data) {
      const decryptdata = decryptData(data);

      setusername(decryptdata?.first_name);
    }
    if (data === null || data === undefined) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);
  return (
    <div className="header">
      <div className="avatar-container">
        <img src={Logo} alt="Logo" className="Logo" />
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <div className="menu-item">{username}</div>
            <div className="menu-item" onClick={handleLogout}>
              Logout
            </div>
          </div>
        )}
      </div>
      <div className="search-container">
        <img
          src={avatarImage}
          alt="Avatar"
          className="avatar"
          onClick={handleAvatarClick}
          style={{ backgroundColor: "red" }}
        />
      </div>
    </div>
  );
};

export default Header;
