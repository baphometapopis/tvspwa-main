import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import * as serviceWorkerRegistration from "./PWAServicefile/service-worker-registration.js";
// import HttpsRedirect from "react-https-redirect";

// Use createRoot instead of ReactDOM.render
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

serviceWorkerRegistration.register();
// <React.StrictMode>

// /* <HttpsRedirect> */
