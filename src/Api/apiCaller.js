import { API_BASE_URL } from "./ApiEndpoint";
// import { getHeaders } from "./apiService";

const makeApiRequest = (endpoint, method = "GET", body = null) => {
  const url = `${API_BASE_URL}/${endpoint}`;

  const requestOptions = {
    method: method.toUpperCase(),
    // headers: getHeaders(),
    body,
    redirect: "follow",
  };

  return fetch(url, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      return result; // You can return the result or process it further
    })
    .catch((error) => {
      throw error; // You can handle the error or propagate it further
    });
};

export default makeApiRequest;
