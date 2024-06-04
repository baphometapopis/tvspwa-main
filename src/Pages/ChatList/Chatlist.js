// ChatComponent.jsx

import React, { useCallback, useEffect, useState } from "react";
import "./ChatStyles.css"; // Import the CSS file
import Header from "../../Component/Header/Header";
import { useLocation, useNavigate } from "react-router-dom";
import { decryptData } from "../../Utils/cryptoUtils";
import { toast } from "react-toastify";

import { fetchChats } from "../../Api/fetchChats";
import { checkerAction } from "../../Api/checkAction";
import { makerAction } from "../../Api/MakerAction";
import Tooltip from "@mui/material/Tooltip";
import back from "../../Assets/Icons/back.png";
import moment from "moment";

const ChatComponent = () => {
  const location = useLocation();

  const [escalationData] = useState(location?.state?.escdata);
  const [formattedTime, setFormattedTime] = useState("");

  const [messages, setMessages] = useState([]);
  const [escalationStatusData, setescalationstatusData] = useState();
  const [newMessage, setNewMessage] = useState("");
  const [loginData, setloginData] = useState("");
  const [error, setError] = useState("");
  const [statusOptions, setStatusOption] = useState(["wip", "resolved"]); // Add your status options here

  const [selectedStatus, setSelectedStatus] = useState("");

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const callChatAPi = useCallback(async () => {
    const localData = localStorage.getItem("TVS_Cache_Data");
    const decryptdata = decryptData(localData);
    setloginData(decryptdata);
    setStatusOption(
      decryptdata?.esclation_type === "maker"
        ? ["Accepted", "Reopen", "reescalate"]
        : ["wip", "resolved"]
    );

    const data = {
      user_id: decryptdata?.id,
      esclation_id: escalationData?.id,
    };
    const chatdata = await fetchChats(data);
    const sortedData = [...chatdata?.data].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });
    setMessages(sortedData);
    setescalationstatusData(chatdata?.esclation_data);
  }, [escalationData]);
  const handleSendMessage = async () => {
    if (!newMessage || !selectedStatus) {
      setError("please type message and select status");
      return;
    }

    const data = {
      esclated_to_comment: newMessage,
      esclation_status: selectedStatus,
      user_id: loginData?.id,
      esclation_id: escalationData?.id,
    };
    if (loginData.admin_role === "escalation_checker") {
      if (newMessage !== "") {
        const senddata = await checkerAction(data);
        if (!senddata?.status) {
          toast.error(senddata?.message, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }
        callChatAPi();
      }
    } else {
      const senddata = await makerAction(data);
      if (!senddata?.status) {
        toast.error(senddata?.message, {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      }
      // After sending the message, fetch the updated chat data
      callChatAPi();

      // const senddata = await makerAction(data);
    }
    setNewMessage("");
    setescalationstatusData("");
  };

  function formatDate(inputDate) {
    const options = {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    const formattedDate = new Date(inputDate).toLocaleString("en-US", options);
    return formattedDate;
  }
  const calculateTimeDifference = (createDate, resolvedDate) => {
    const now = isNaN(Date.parse(resolvedDate))
      ? moment()
      : moment(resolvedDate);
    const createDateObj = moment(createDate);
    // const timeDifference = now - createDateObj;
    // const duration = moment.duration(now.diff(createDateObj));
    const duration = moment.duration(now.diff(createDateObj));

    // console.log(duration,createDate,resolvedDate);

    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    // Build the formatted string
    const formattedTime =
      days > 0
        ? `${days} day${days > 1 ? "s" : ""}`
        : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
          )}:${String(seconds).padStart(2, "0")}`;

    return formattedTime;
  };

  const handleStatusChange = async (newStatus) => {
    setSelectedStatus(newStatus);
    setIsStatusDropdownOpen(false);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    // Set up an interval to call the function every 3 minutes (180,000 milliseconds)
    const intervalId = setInterval(() => {
      callChatAPi();
    }, 180000);

    // Cleanup function to clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [callChatAPi]);
  useEffect(() => {
    callChatAPi();
  }, [callChatAPi, escalationData, isStatusDropdownOpen]);
  useEffect(() => {
    // Check if the resolved date is a valid date

    setFormattedTime(
      calculateTimeDifference(
        escalationStatusData?.created_at,
        escalationStatusData?.esclation_query_resolved_at
      )
    );
    if (
      isNaN(
        new Date(escalationStatusData?.esclation_query_resolved_at).getTime()
      )
    ) {
      const intervalId = setInterval(() => {
        setFormattedTime(
          calculateTimeDifference(
            escalationStatusData?.created_at,
            escalationStatusData?.esclation_query_resolved_at
          )
        );
      }, 1000);

      // Cleanup function to clear the interval when the component is unmounted
      return () => clearInterval(intervalId);
    }
  }, [
    escalationStatusData?.created_at,
    escalationStatusData?.esclation_query_resolved_at,
  ]);
  return (
    <div className="Homecnt">
      <Header />
      <div className="chat-container">
        <button className="back-button" onClick={handleGoBack}>
          <img
            src={back}
            alt="Logo"
            style={{ height: "30px", width: "30px" }}
          />
        </button>
        {true && (
          <div className="chatstatusHeader">
            <p style={{ fontSize: "14px" }}>
              <span>Status :</span>
              {escalationStatusData?.esclation_status}
            </p>
            <p style={{ fontSize: "14px" }}>
              Completion Status :
              {escalationStatusData?.esclation_status_completion}
            </p>

            <p style={{ fontSize: "14px" }}>
              Creation Date :{formatDate(escalationStatusData?.created_at)}-(
              {formattedTime})
            </p>
          </div>
        )}
        {messages && (
          <div className="chat-container2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${
                  message.user_id !== loginData?.id
                    ? " box3 sb14"
                    : " box4 sb13"
                }`}
              >
                <p className="chatUsername">{message?.username}</p>
                <p
                  className="chatStatus"
                  style={{
                    color:
                      message.esclation_status === "Pending"
                        ? "#e54a50" // Pending color
                        : message.esclation_status === "WIP"
                        ? "#eec75b" // WIP color
                        : message.esclation_status === "Resolved"
                        ? "#5d9db9" // Resolved color
                        : message.esclation_status === "Accepted"
                        ? "#6fb293" // Accepted color
                        : message.esclation_status === "Reopen"
                        ? "#d7Oe17" // Reopen color
                        : message?.esclation_status_completion === "Accepted"
                        ? "#04cf00"
                        : "red", // Default color for other cases
                  }}
                >
                  {message?.esclation_status ||
                    message?.esclation_status_completion}
                </p>
                <p
                  style={{
                    paddingBottom: "15px",
                    zIndex: 1,
                    position: "sticky",
                    paddingLeft: "10px",
                    color: "#4F4F4F",
                    width: "95%",
                  }}
                >
                  {message?.common_comment}
                </p>
                <p
                  style={{
                    fontSize: "8px",
                    position: "absolute",
                    right: "10px",
                    bottom: "2px",
                    // fontWeight: "600",
                    color: "#4F4F4F",
                  }}
                >
                  {formatDate(message?.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="messagecontainer">
          <input
            type="text"
            className="message-input"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              setError("");
            }}
            style={{ flex: 1 }}
          />
          <div className="custom-dropdown" onClick={() => setError("")}>
            <button
              className="status-button"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              style={{
                backgroundColor:
                  selectedStatus === "Pending"
                    ? "#e54a50" // Pending color
                    : selectedStatus === "wip"
                    ? "#eec75b" // WIP color
                    : selectedStatus === "Resolved"
                    ? "#5d9db9" // Resolved color
                    : selectedStatus === "Accepted"
                    ? "#6fb293" // Accepted color
                    : selectedStatus === "Reopen"
                    ? "#FFA500" // Reopen color
                    : selectedStatus === "reesclate"
                    ? "red"
                    : "#007bff",
              }}
            >
              {selectedStatus || "Change Status"}
            </button>
            {isStatusDropdownOpen && (
              <div className="dropdown-content">
                {statusOptions.map((status) => (
                  <div key={status} onClick={() => handleStatusChange(status)}>
                    {status}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Tooltip title={error || ""} arrow open={error ? true : false}>
            <button className="send-button" onClick={handleSendMessage}>
              Send
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
