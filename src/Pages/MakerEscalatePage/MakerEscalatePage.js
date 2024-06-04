// Dashboard.js

import React, { useCallback, useEffect, useState } from "react";
import "./MakerEscalatePage.css"; // Import the CSS file
import Header from "../../Component/Header/Header";
import { useLocation, useNavigate } from "react-router-dom";
import { getEscalationCataegoryList } from "../../Api/getEscalationcategorylist";
import { decryptData } from "../../Utils/cryptoUtils";
import { toast } from "react-toastify";
import supportAgent from "../../Assets/Icons/supportAgent.png";
import chat from "../../Assets/Icons/chat.png";
import back from "../../Assets/Icons/back.png";
import { Badge } from "antd";

import Select from "react-select";
import { Tooltip } from "@mui/material";
import { raiseEscalation } from "../../Api/raiseEscalation";
import { IndividualesclationListAPI } from "../../Api/IndividualesclationList";
import moment from "moment";

const MakerEscalatePage = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const [searchData] = useState(location?.state?.searchData?.data);
  const [searchHistory, setsearchHistory] = useState([]);

  const [jobID] = useState(location?.state?.searchData?.data?.jobid);
  const [selectedOption, setSelectedOption] = useState(null);
  const [issueDescription, setIssueDescription] = useState("");

  const [isModalOpen, setModalOpen] = useState(false);
  const [escalationList, setEscalationList] = useState([]);
  const [categoryList, setcategoryList] = useState([]);
  const [loginData, setLoginData] = useState();
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("cases"); // Default tab is "cases"

  const handleSend = async () => {
    // Check if an option is selected
    if (!issueDescription.trim() && !selectedOption) {
      setError("Please describe the issue and select an option");
      return;
    } else {
      setError(null);
    }

    // Clear the error state

    // Call your function with selectedOption and issueDescription
    // YourFunction(selectedOption, issueDescription);

    // For demonstration purposes, log the values

    // Close the modal

    const data = {
      esclated_by_comment: issueDescription,
      esclated_by_category_id: selectedOption.value,
      job_id: jobID,

      user_id: loginData?.id,
    };

    const escalateissue = await raiseEscalation(data);
    if (escalateissue.status) {
      toast.success("Escalation raised Successfully", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      fetchEscalationList();
    } else {
      toast.error(escalateissue?.message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }

    // Clear the form fields if needed
    setSelectedOption(null);
    setIssueDescription("");

    handleInputFocus();
    closeModal();
  };
  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };
  const findCategoryname = (category_id) => {
    const answers = categoryList
      .filter((item) => item.id === category_id)
      .map((item) => item.answer);

    return answers;
  };
  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);
  };
  const fetchEscalationList = useCallback(async () => {
    try {
      const categorydata = await getEscalationCataegoryList();
      if (categorydata.status) {
        setcategoryList(categorydata.data);
      }

      const localData = localStorage.getItem("TVS_Cache_Data");
      if (localData !== null || localData !== undefined) {
        const decryptdata = decryptData(localData);
        setLoginData(decryptdata);

        const data = await IndividualesclationListAPI(jobID);
        if (data?.status) {
          setEscalationList(data?.escalation_log);
          setsearchHistory(data?.job_status_history);
        } else {
          toast.error(data?.message, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }
      }
    } catch (error) {
      console.error("Error in fetchEscalationList:", error);
    }
  }, [
    setcategoryList,
    setLoginData,
    setEscalationList,
    setsearchHistory,
    jobID,
  ]);
  const handleGoBack = () => {
    navigate(-1);
  };

  const handleInputFocus = () => {
    // Clear the error state when the input is focused
    setError(null);
  };

  useEffect(() => {
    fetchEscalationList();
  }, [fetchEscalationList]);
  useEffect(() => {}, [isModalOpen, selectedOption, issueDescription]);
  return (
    <div className="dashboardcnt">
      <Header />
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <p className="modal-header-label">Escalate an Issue</p>
            </div>
            <div style={{ padding: "10px" }}>
              <div className="modal-dropdown">
                <Select
                  className="search-dropdown"
                  options={categoryList.map((item) => ({
                    label: item.answer,
                    value: item.id,
                  }))}
                  isClearable
                  placeholder="Select an option"
                  value={selectedOption}
                  onChange={(selected) => {
                    setSelectedOption(selected);
                    handleInputFocus();
                  }}
                />
              </div>
              <Tooltip title={error || ""} arrow open={Boolean(error)}>
                <div className="modal-description">
                  <textarea
                    id="issueDescription"
                    name="issueDescription"
                    rows="15"
                    placeholder="Describe the issue"
                    onChange={(text) => {
                      setIssueDescription(text.target.value);
                      handleInputFocus();
                    }}
                  />
                </div>
              </Tooltip>
            </div>
            {/* Send button */}

            <div style={{ display: "flex", flexDirection: "row-reverse" }}>
              <button className="modal-send" onClick={handleSend}>
                Send
              </button>
            </div>

            {/* <button onClick={closeModal}>Close Modal</button> */}
          </div>
        </div>
      )}
      <button className="back-button" onClick={handleGoBack}>
        <img src={back} alt="Logo" style={{ height: "30px", width: "30px" }} />
      </button>
      <div className="info-container">
        <div className="info-box">
          <Badge.Ribbon
            text={`${searchData?.policy_status}`}
            color={searchData?.policy_status === "Active" ? "green" : "red"}
            style={{
              position: "absolute",
              top: "-10px",
              right: "-24px",
              fontSize: "18px",
              padding: "5px",
            }}
          >
            <div>
              <div className="profileContainer">
                <div className="infolabels-container">
                  <div className="infolabel">Name</div>
                  <div className="infolabel">Phone No</div>
                  <div className="infolabel">Policy No</div>
                  <div className="infolabel">Plan</div>

                  <div className="infolabel">Job ID</div>
                  <div className="infolabel">Chassis No</div>
                  <div className="infolabel">Vehicle No</div>
                  <div className="infolabel">Dealer Name:</div>
                  <div className="infolabel">Model</div>

                  <div className="infolabel">Policy Period:</div>

                  {/* <div className="infolabel">Nature of Complaint :</div> */}
                </div>
                <div className="values-container">
                  <p className="labelvalue">
                    :{searchData?.customer_name || null}
                  </p>
                  <p className="labelvalue">
                    :{searchData?.customer_mobile_no || null}
                  </p>
                  <p className="labelvalue">:{searchData?.policy_no || null}</p>
                  <p className="labelvalue">:{searchData?.plan_name || null}</p>

                  <p className="labelvalue">:{searchData?.jobid || null}</p>
                  <p className="labelvalue">:{searchData?.frame_no || null}</p>
                  <p className="labelvalue">
                    :{searchData?.registration_no || null}
                  </p>
                  <p className="labelvalue">
                    :{searchData?.dealer_name || null}
                  </p>
                  <p className="labelvalue">:{searchData?.model || null}</p>
                  <p className="labelvalue">
                    :
                    {moment(searchData?.policy_effective_date).format(
                      "DD/MM/YYYY"
                    )}{" "}
                    -{" "}
                    {moment(searchData?.sold_policy_end_date).format(
                      "DD/MM/YYYY"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Badge.Ribbon>

          {loginData?.esclation_type === "maker" && (
            <button
              className="escalatebutton"
              onClick={openModal}
              type="submit"
            >
              Escalate
            </button>
          )}
        </div>

        <div className="top-tabs">
          <div
            className={`top-tab ${selectedTab === "cases" ? "active" : ""}`}
            onClick={() => handleTabClick("cases")}
          >
            List
          </div>
          <div
            className={`top-tab ${selectedTab === "no-cases" ? "active" : ""}`}
            onClick={() => handleTabClick("no-cases")}
          >
            Progress
          </div>
        </div>

        <div className="scrollable-container">
          {selectedTab === "cases" ? (
            escalationList.length === 0 ? (
              <div className="no-cases-message">
                {loginData?.admin_role === "escalation_maker"
                  ? "No pending cases"
                  : "No cases have been assigned to you"}
              </div>
            ) : (
              <div className="card-container">
                {escalationList.map((item) => (
                  <div className="homecard" key={item.id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <p className="jobid">#{item.id}</p>
                      <p
                        className="statustag"
                        style={{
                          backgroundColor:
                            item.esclation_status === "Pending"
                              ? "#e54a50" // Pending color
                              : item.esclation_status === "WIP"
                              ? "#eec75b" // WIP color
                              : item.esclation_status === "Resolved"
                              ? "#5d9db9" // Resolved color
                              : item.esclation_status === "Accepted"
                              ? "#6fb293" // Accepted color
                              : item.esclation_status === "Reopen"
                              ? "#d7Oe17" // Reopen color
                              : "white", // Default color for other cases
                        }}
                      >
                        {item.esclation_status}
                      </p>
                    </div>
                    <div
                      style={{
                        paddingTop: "5px",
                        paddingBottom: "5px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <p className="escalatedby">by {item.from_name}</p>

                        <p>{findCategoryname(item.esclated_by_category_id)}</p>
                      </div>
                      <img
                        src={chat}
                        alt="Logo"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          navigate("/chat", {
                            state: { escdata: item },
                          });
                        }}
                        className="chatICon"
                      />
                    </div>
                    {/* <p>{item.esclated_by_comment}</p> */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <img
                          src={supportAgent}
                          alt="Logo"
                          className="supporticon"
                        />
                        <p className="tobabel"> {item.to_name}</p>
                      </span>
                      <p className="creationdate">
                        {new Date(item.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="vertical-stepper-container">
              <div className="vertical-bar"></div>
              <div className="content-container">
                <div className="card-container">
                  {searchHistory
                    .slice()
                    .reverse()
                    .map((step, index) => (
                      <div key={index} className="card">
                        <div className={"step"}>
                          <div className="step-number">
                            {searchHistory.length - index}
                          </div>
                          <div className="step-content">
                            <p style={{ marginBottom: "10px" }}>
                              {step.status_labal}
                            </p>
                            <p>Comment: {step.comment}</p>

                            <p
                              style={{
                                position: "absolute",
                                right: 10,
                                color: "#696969",
                                fontSize: "14px",
                              }}
                            >
                              {new Date(step.create_date).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                  hour12: true,
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="horizontal-line"></div>
                {/* Additional card content goes here */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MakerEscalatePage;
