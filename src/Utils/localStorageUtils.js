// src/utils/localStorageUtils.js
export const setItemToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true; // Operation successful
  } catch (error) {
    console.error("Error setting item to local storage:", error);
    return false; // Operation failed
  }
};
