// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Pages/Login/Login";
import MakerEscalatePage from "./Pages/MakerEscalatePage/MakerEscalatePage";
import "./App.css";
import Home from "./Pages/Home/Home";
import { ToastContainer } from "react-toastify";
import ChatComponent from "./Pages/ChatList/Chatlist";
function App() {
  console.log(
    "%c TVS Escalation ",
    "background: #222; color: #bada55; font-size: 24px; padding: 10px;"
  );
  console.log(
    "%c What are you doing here? Is there a bug? ",
    "background: #222; color: #fff; font-size: 16px; padding: 10px;"
  );

  return (
    <Router>
      <div className="App">
        <ToastContainer />

        <Routes>
          <Route
            path="/home/MakerEscalatePage"
            element={<MakerEscalatePage />}
          />
          <Route path="/home" element={<Home />} />
          <Route path="/Chat" element={<ChatComponent />} />

          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
