// Login.js

import React, { useCallback, useEffect, useState } from "react";
import "./login.css"; // Import the CSS file
import { login } from "../../Api/loginApi";
import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { useLocation, useNavigate } from "react-router-dom";
import { encryptData } from "../../Utils/cryptoUtils";
import { setItemToLocalStorage } from "../../Utils/localStorageUtils";

const Login = () => {
  const navigation = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    let validationErrors = {};

    if (!formData.username.trim()) {
      validationErrors.username = "Username is required";
    }

    if (!formData.password.trim()) {
      validationErrors.password = "Password is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Add your authentication logic here (e.g., API call, etc.)
    handleLoginApi();
  };

  const checkLoginStatus = useCallback(() => {
    const data = localStorage.getItem("TVS_Cache_Data");
    if (data === null || data === undefined) {
      navigation("/");
    } else {
      navigation("/Home");
    }
  }, [navigation]);
  const handleLoginApi = async () => {
    // window.location.href =
    //   "http://localhost:3000/Login/?redirection_key=TTZIeFJneERGekE4SVRRWHovakJSQVFIYVExUGpvU3Q1UEJlaXRzR3g0OD0=";

    // // window.location.href =
    // //   "https://hospicash.mylmsnow.com/Login/redirection_key=TTZIeFJneERGekE4SVRRWHovakJSQVFIYVExUGpvU3Q1UEJlaXRzR3g0OD0=";

    try {
      const loginResponse = await login(formData.username, formData.password);

      if (loginResponse?.status) {
        const encryptedData = encryptData(loginResponse.data);

        // Attempt to store data in local storage
        // Check if the user is logged in after storing data
        const isSetSuccessful = setItemToLocalStorage(
          "TVS_Cache_Data",
          encryptedData
        );

        if (isSetSuccessful) {
          // If the user is logged in, navigate to the home page
          toast.success(loginResponse?.message, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });

          navigation("/Home");
        }
      } else {
        // Failed login
        toast.error(loginResponse?.message, {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      // Handle other errors if needed
      toast.error("An error occurred during login");
    }
  };
  useEffect(() => {
    // Display the message if it exists in the location state
    if (location.state && location.state.message) {
      // You can use your notification or alert mechanism here
      toast.error(location?.state?.message, {
        position: "bottom-right",
        autoClose: 3000, // Set the duration for the toast to be displayed
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
    checkLoginStatus();
  }, [location.state, checkLoginStatus]);
  return (
    <div className="logincontainer">
      <div className="logincontainer1">
        <div
          style={{
            backgroundColor: "red",
            width: "100%",
            padding: "10px",
          }}
        >
          <h2 style={{ fontSize: "12px", color: "white" }}>
            TVS Escalation Login
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "20px" }}>
            <div style={{ padding: "10px", position: "relative" }}>
              <input
                className="input"
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
              />
              {errors.username && (
                <span className="error">{errors.username}</span>
              )}
            </div>
            <div style={{ padding: "10px", position: "relative" }}>
              <input
                className="input"
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
              />
              {errors.password && (
                <span className="error">{errors.password}</span>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button className="button" type="submit">
                Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
