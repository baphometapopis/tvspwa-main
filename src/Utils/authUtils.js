// src/utils/authUtils.js
export const isLoggedIn = () => {
    return !!localStorage.getItem("TVS_Cache_Data");
  };
  