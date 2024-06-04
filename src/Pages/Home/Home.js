// Home.js
import React, { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import "./Home.css"; // Import the CSS file
import Header from "../../Component/Header/Header";
import { useNavigate } from "react-router-dom";
import { escalationListApi } from "../../Api/escalationListAPi";
import { decryptData } from "../../Utils/cryptoUtils";
import Tooltip from "@mui/material/Tooltip";
// import chat from "../../Assets/Icons/chat.png";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Import the CSS file for styling


import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { searchEscalationData } from "../../Api/searchEscalationData";
import ReactDatePicker from "react-datepicker";
import moment from "moment";
import { setItemToLocalStorage } from "../../Utils/localStorageUtils";
import { ChassisImg, ClearFilter, Close, Close2, EngineImg, Filter, PhoneImg, supportAgent, ViewData } from "../../Constant/Imageconstant";
const Home = () => {
  const navigate = useNavigate();
  const [escalationList, setEscalationList] = useState([]);
  const [recentList, setrecentList] = useState([]);
  const [selectedTab, setSelectedTab] = useState("cases"); // Default tab is "cases"

  const [filterType, setFilterType] = useState("Pending");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginData, setLoginData] = useState();
  const [userName, setUserName] = useState("");
  const [error, setError] = useState(null);
  const [isListLoading, setIsListLoading] = useState(false);

  const [appliedFilter, setAppliedFilter] = useState({ start_date: '',
    end_date: '',
    status_id: '',});

  const [validationerror, setvalidationerror] = useState(null);

  const [timeDifference, setTimeDifference] = useState("");

  const searchOptions = [
    { value: "jobid", label: "Job Id" },
    { value: "customer_mobile_no", label: "Phone Number" },
    { value: "policy_no", label: "Policy No" },
    { value: "frame_no", label: "Chassis Number" },
    { value: "registration_no", label: "Vehicle Number" },
  ];
  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleFilter = () => {
    // Handle the selected date range, you can perform actions here
    // Assuming startDate and endDate are variables representing the start and end dates
   
 localStorage.removeItem('TVS_applied_filter')


    let originalstartDate, originalendDate;

    if (startDate) {
      originalstartDate = new Date(startDate);
    } else {
      originalstartDate = new Date(); // Use today's date if startDate is null
    }

    if (endDate) {
      originalendDate = new Date(endDate);
    } else {
      originalendDate = new Date(); // Use today's date if endDate is null
    }

    const formattedendDate = `${originalendDate.getFullYear()}-${String(
      originalendDate.getMonth() + 1
    ).padStart(2, "0")}-${String(originalendDate.getDate()).padStart(2, "0")}`;

    const formattedstartDate = `${originalstartDate.getFullYear()}-${String(
      originalstartDate.getMonth() + 1
    ).padStart(2, "0")}-${String(originalstartDate.getDate()).padStart(
      2,
      "0"
    )}`;

    // Now, formattedstartDate and formattedendDate contain the formatted dates.

    const filterdata = {
      start_date: formattedstartDate,
      end_date:formattedendDate,
      status_id:  filterType,
    };

    localStorage.setItem("TVS_applied_filter", JSON.stringify(filterdata));

setAppliedFilter(filterdata);
    
    fetchEscalationList(filterdata);

    // Close the modal
    handleModalClose();
  };

  const [selectedOption, setSelectedOption] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async (prop, id,item) => {
    // Check if the selected option is null or the searchQuery is empty

     // Check if the item already exists in the recentList

    if (prop !== "ViewDocument") {
      if (!selectedOption || !searchQuery.trim()) {
        // Set an error state
        setError("Please select an option and enter a valid search term.");
        return;
      }

      if (validationerror) {
        return;
      }
    }

    // Reset error state if no error
    setError(null);

    const searchdata = await searchEscalationData(
      prop === "ViewDocument" ? searchOptions[0]?.value : selectedOption?.value,
      prop === "ViewDocument" ? id : searchQuery,
      loginData?.id
    );
    if (searchdata?.status) {
      const existingItemIndex = recentList.findIndex(recentItem => recentItem.jobid === searchdata?.data?.jobid);

      // Create a new list without the existing item if found
      let updatedList = existingItemIndex !== -1
        ? [...recentList.slice(0, existingItemIndex), ...recentList.slice(existingItemIndex + 1)]
        : [...recentList];
    
      // Add the new item to the beginning of the list
      updatedList = [searchdata?.data, ...updatedList];
    
      // Update state and local storage
      setrecentList(updatedList);
      setItemToLocalStorage("recentList", JSON.stringify(updatedList));
    
      navigate("MakerEscalatePage", { state: { searchData: searchdata } });

      toast.success(searchdata?.message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } else {
      toast.error(searchdata?.message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      setSelectedOption(null);
      setSearchQuery("");
    }
  };

  const handleRemoveItem = (id) => {
    console.log(id)
    const updatedRecentList = recentList.filter((item) => item.id !== id);

    setrecentList(updatedRecentList);
    setItemToLocalStorage("recentList", JSON.stringify(updatedRecentList));

  };
  const fetchEscalationList = useCallback(async (filterdata) => {
      if(filterdata){
      setAppliedFilter(filterdata);}

      const localData = localStorage.getItem("TVS_Cache_Data");

      if (localData !== null || localData !== undefined) {
        const decryptdata = decryptData(localData);
        setLoginData(decryptdata);
        setUserName(
          `${decryptdata?.first_name ?? ""} ${decryptdata?.last_name ?? ""}`
        );

        const finalfilterData = {
          ...filterdata,
          user_id: decryptdata?.id,
        };
        setIsListLoading(true)

        const data = await escalationListApi(finalfilterData);

        if (data?.status) {
          setEscalationList(data.data);
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
      setIsListLoading(false)

    },
    [setLoginData, setUserName, setEscalationList]
  );

  const handleInputFocus = () => {
    // Clear the error state when the input is focused
    setError(null);
  };
  const calculateTimeDifference = (createDate, resolvedDate) => {
    const currentDate = isNaN(Date.parse(resolvedDate))
      ? moment()
      : moment(resolvedDate);
    const createDateObj = moment(createDate);

    // Check for invalid dates

    const duration = moment.duration(currentDate.diff(createDateObj));

    // Get the difference in days, hours, minutes, and seconds
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

  const handleInputChange = (e) => {
    const sanitizedValue = e.target.value?.replace(/[^a-zA-Z0-9]/g, "");
    setSearchQuery(sanitizedValue);
    // setSearchQuery(e.target.value);

    if (selectedOption?.value === "customer_mobile_no") {
      const regex = /^[6-9]\d{9}$/; // Indian phone number regex
      setvalidationerror(
        sanitizedValue && !regex.test(sanitizedValue)
          ? "Invalid  phone number"
          : ""
      );
    } else if (selectedOption?.value === "jobid") {
      const regex = /^\d+$/; // Only accept numbers
      setvalidationerror(
        sanitizedValue && !regex.test(sanitizedValue)
          ? "Invalid job ID (Only numbers are allowed)"
          : ""
      );
    } else {
      setvalidationerror("");
    }
  };

  const checkLoginStatus = useCallback(async () => {
    const data =  localStorage.getItem("TVS_Cache_Data");
    if (data === null || data === undefined) {
      navigate("/");
    } else {
      navigate("/Home");
    }
  }, [navigate]);

  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);
  };



  useEffect(() => {
    const handleBack = () => {
      // Replace the current entry in the navigation stack with the home screen
      navigate("/Home", { replace: true });
    };

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [navigate]);
  useEffect(() => {
    checkLoginStatus();
    const getFilter = JSON.parse(localStorage.getItem("TVS_applied_filter"));


    fetchEscalationList(getFilter);
  }, [checkLoginStatus, fetchEscalationList]);
  useEffect(() => {
    // Update time difference for each item initially
    const initialTimeDifferences = escalationList.map((item) =>
      calculateTimeDifference(item.created_at)
    );
    setTimeDifference(initialTimeDifferences);

    // Set up interval to update time difference every second
    const intervalId = setInterval(() => {
      const updatedTimeDifferences = escalationList.map((item) =>
        calculateTimeDifference(
          item.job_create_date,
          item.esclation_query_resolved_at
        )
      );

      setTimeDifference(updatedTimeDifferences);
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [escalationList]);

  useEffect(() => {
    const storedRecentListJson = localStorage.getItem("recentList");
    let storedRecentList;
    
    if (storedRecentListJson) {
      try {
        storedRecentList = JSON.parse(storedRecentListJson);
      } catch (error) {
        // Handle parsing error (e.g., log error, provide default value, etc.)
        console.error("Error parsing recentList JSON:", error);
      }
    }
    
    // Now you can use storedRecentList variable, which may be undefined if parsing failed
        if (storedRecentList) {
      setrecentList(storedRecentList);
    }
  }, []);


  useEffect(() => {
    const handleResize = () => {
      setSelectedTab('cases');
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  useEffect(()=>{},[isListLoading])
  return (
    <div className="Homecnt">
      <Header username={userName} />
      <div
        className="user-info"
        style={{ backgroundColor: "red", width: "100%", padding: 20 }}
      >
        <span style={{ display: "inline-block" }}>
          <p
            style={{
              fontWeight: "600",
              fontSize: "22px",
              color: "white",
              fontFamily: "sans-serif",
            }}
          >
            WelcomeBack,
          </p>
        </span>
        {userName}
      </div>
      <div className="mainContainer"> 

  
      <div className="homecnt2">

      
        {true&& (
          <div className="homesearch-container">
            <Select
              className="search-dropdown"
              options={searchOptions}
              isClearable
              placeholder="Select an option"
              value={selectedOption}
              onChange={(e) => setSelectedOption(e)}
            />

            <Tooltip title={validationerror || ""} arrow open={validationerror}>
              <input
                type="text"
                className="search-input"
                placeholder={`Enter ${selectedOption?.label || "search term"}`}
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus} // Clear error when input is focused
              />
            </Tooltip>

            <Tooltip
              title={error || ""}
              arrow
              open={Boolean(error)}
              style={{ position: "relative" }}
            >
              <button className="search-button" onClick={handleSearch}>
                Search {selectedOption?.label || "All"}
              </button>
            </Tooltip>
          </div>
        )}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content" style={{ paddingBottom: "5px" }}>
              <div className="modal-header" style={{ position: "relative" }}>
                <p className="modal-header-label">Filter Options</p>
                <img
                  src={Close}
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    height: "20px",
                    width: "20px",
                    position: "absolute",
                    top: "12px",
                    right: "10px",

                  }}
                  alt="close"
                />
              </div>{" "}
              <div style={{ padding: "10px" }}>
                <div className="modal-dropdown">
                  <label className="date-picker-label">Filter Status</label>
                  <select
                    className="selectfilter"
                    value={filterType}
                    onChange={handleFilterChange}
                  >
                    {/* <option value="">All</option> */}

                    <option value="Pending">Pending</option>
                    <option value="WIP">WIP</option>
                    <option value="Resolved">Resolved</option>
                    {/* <option value="Accepted">Accepted</option> */}
                    {/* <option value="Reopen">Reopen</option> */}
                  </select>
                </div>
                <div className="date-logo-container">
                  {/* <img src={dateLogo} alt="Date Logo" className="date-logo" /> */}
                </div>
                <div
                  className="date-picker-container"
                  style={{ position: "relative" }}
                >
                  <div style={{ display: "flex" }}>
                    <label style={{ position: "absolute", top: "-21px" }}>
                      Start Date
                    </label>
                    <ReactDatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      placeholderText="Start Date"
                    />
                    <label
                      style={{
                        position: "absolute",
                        top: "-21px",
                        right: "127px",
                      }}
                    >
                      End Date
                    </label>

                    <ReactDatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      placeholderText="End Date"
                    />
                  </div>
                  <div></div>
                </div>
              </div>
              <div className="button-container">
                <button className="apply-button" onClick={handleFilter}>
                  Apply
                </button>
                {/* <button onClick={handleModalClose}>Cancel</button> */}
              </div>
            </div>
          </div>
        )}

        <div className="top-tabs-home">
          <div
            className={`top-tab ${selectedTab === "cases" ? "active" : ""}`}
            onClick={() => handleTabClick("cases")}
          >
            Cases List
          </div>
          <div
            className={`top-tab ${selectedTab === "recent-views" ? "active" : ""}`}
            onClick={() => handleTabClick("recent-views")}
          >
            Recent Views
          </div>
         {recentList.length!==0&& <>  <div style={{backgroundColor:'#051B34',position:'absolute',right:-3,borderRadius:'100px',padding:'12px',top:-5}}></div>
           <p style={{color:'white',padding:'5px',borderRadius:'50px',position:'absolute',right:0,top:-10}}>{recentList.length}</p></>}
        </div>

{ selectedTab==='recent-views'&& <>    {recentList.length!==0&& <div className="scrollable-container recentContainer "> <div className="card-container">
      <div onClick={()=>{localStorage.removeItem("recentList");setrecentList([])} } style={{backgroundColor:'#c5bcbc',borderRadius:'25px'}}><p style={{color:'white',margin:'5px',marginLeft:'10px',marginRight:'10px',cursor:'pointer'}}>X  Clear Recent Views</p></div>
          
              {recentList?.map((item, index) => (
                <div
                className={`homecard ${item?.toBeRemoved ? 'slideOut' : ''}`}
                key={item.id}
                  style={{
                    backgroundColor:
                      item?.esclation_sub_type !== "icpl_sales"
                        ? "#ffe6e6"
                        : "",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      margin:'5px'
                    }}
                  >
                    <div>
                    <img
                        src={Close2}
                        onClick={() => handleRemoveItem(item?.id)}

                        alt="Logo"
                        style={{ cursor: "pointer" ,position:'absolute',right:-15,top:-5}}
                        className="viewData"
                      />
                      <p className="jobid">#{item?.jobid}</p>
                      <p className="escalatedby">by {item?.from_name}</p>
                    </div>
                    <div style={{ flexDirection: "row", display: "flex" }}>
                      <img
                        src={ViewData}
                        onClick={() => {
                          handleSearch("ViewDocument", item?.jobid);
                        }}
                        alt="Logo"
                        style={{ cursor: "pointer" }}
                        className="viewData"
                      />
                      <p
                        className="statustag"
                        style={{
                          backgroundColor:
                            item?.esclation_status === "Pending"
                              ? "#e54a50" // Pending color
                              : item?.esclation_status === "WIP"
                              ? "#eec75b" // WIP color
                              : item?.esclation_status === "Resolved"
                              ? "#5d9db9" // Resolved color
                              : item?.esclation_status === "Accepted"
                              ? "#6fb293" // Accepted color
                              : item?.esclation_status === "Reopen"
                              ? "#d7Oe17" // Reopen color
                              : "white", // Default color for other cases
                        }}
                      >
                        {item?.esclation_status}
                      </p>
                      <p
                        style={{
                          position: "absolute",
                          fontSize: "12px",
                          top: "40px",
                          right: "15px",
                        }}
                      >
                        {timeDifference[index]}
                      </p>
                    </div>
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
                      <img src={ChassisImg} alt="Logo" className="chassisImg" />
                      <img src={PhoneImg} alt="Logo" className="phoneImg" />
                      <img src={EngineImg} alt="Logo" className="engineImg" />
                      <p>{item?.customer_name}</p>
                      <p className="card_mobile_no">{item?.customer_mobile_no}</p>
                      <p className="card_engine_no">{item?.engine_number}</p>
                      <p className="card_chassis_no">{item?.frame_no}</p>
                    </div>
                    {/* <img
                      src={chat}
                      alt="Logo"
                      onClick={() => {
                        navigate("/chat", {
                          state: { escdata: item },
                        });
                      }}
                      className="chatICon"
                    /> */}
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
                        marginTop: "38px",
                      }}
                    >
                      <img
                        src={supportAgent}
                        alt="Logo"
                        className="supporticon"
                      />
                      <p className="tobabel"> {item?.to_name}</p>
                    </span>

                    <p className="cardic_name">IC Name:{item?.rsa_ic_name}</p>

                    <p className="creationdate">
                      JOB crt:{" "}
                      {new Date(item?.job_create_date).toLocaleString("en-US", {
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
            </div></div>}   

            </>}

        
       { selectedTab==='cases' &&  <> <div className="filterHeader">

<div  className='filterContainer'>
  
       {appliedFilter?.start_date!==''&&appliedFilter?.end_date!==''&&appliedFilter?.status_id!=='' && <>   <span   style={{display:'flex'
                        }}>Applied Filter : <p style={{ paddingRight:'10px',height:'fit-content',paddingLeft:'10px',color:'white',borderRadius:'5px', backgroundColor:
                          appliedFilter.status_id === "Pending"
                              ? "#e54a50" // Pending color
                              : appliedFilter.status_id === "WIP"
                              ? "#eec75b" // WIP color
                              : appliedFilter.status_id === "Resolved"
                              ? "#5d9db9" // Resolved color
                              : appliedFilter.status_id=== "Accepted"
                              ? "#6fb293" // Accepted color
                              : appliedFilter.status_id === "Reopen"
                              ? "#d7Oe17" // Reopen color
                              : "white", // Default color for other cases
                            }}> {appliedFilter.status_id}</p></span>
         
          <p>Date : {appliedFilter.start_date}- {appliedFilter.end_date} </p>
</>}


        
        
        
        
        
          </div>


          
          <div >
         {appliedFilter?.start_date!==''&&appliedFilter?.end_date!==''&&appliedFilter?.status_id!=='' &&  <img
            src={ClearFilter}
            onClick={()=>{ localStorage.removeItem('TVS_applied_filter');fetchEscalationList();window.location.reload()}}
            alt="Logo"
            style={{ cursor: "pointer" }}
            className="viewData"
          />}
          <img
            src={Filter}
            onClick={handleModalOpen}
            alt="Logo"
            style={{ cursor: "pointer" }}
            className="viewData"
          />
          </div>
          




          {/* <button onClick={handleModalOpen}>Open Modal</button> */}
        </div>
        
        <div className="scrollable-container " style={{ marginTop: "10px"}}>


        { isListLoading ?
          
          <Skeleton count={5}  height={200}  baseColor="#ffffff" highlightColor="#e0e0e0"  />
         
:<>
          {escalationList.length === 0 ? (
            <div className="no-cases-message">
              {loginData?.admin_role === "escalation_maker"
                ? "No  cases Found"
                : "No cases have been assigned to you"}
            </div>
          ) 
          
          : 
          
           
            <div className="card-container">
              {escalationList.map((item, index) => (
                <div
                  className="homecard"
                  key={item.id}
                  style={{
                    backgroundColor:
                      item?.esclation_sub_type !== "icpl_sales"
                        ? "#ffe6e6"
                        : "",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <p className="jobid">#{item.job_id}</p>
                      <p className="escalatedby">by {item.from_name}</p>
                    </div>
                    <div style={{ flexDirection: "row", display: "flex" }}>
                      <img
                        src={ViewData}
                        onClick={() => {
                          handleSearch("ViewDocument", item?.job_id,item);
                        }}
                        alt="Logo"
                        style={{ cursor: "pointer" }}
                        className="viewData"
                      />
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
                      <p
                        style={{
                          position: "absolute",
                          fontSize: "12px",
                          top: "32px",
                          right: "15px",
                        }}
                      >
                        {timeDifference[index]}
                      </p>
                    </div>
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
                      <img src={ChassisImg} alt="Logo" className="chassisImg" />
                      <img src={PhoneImg} alt="Logo" className="phoneImg" />
                      <img src={EngineImg} alt="Logo" className="engineImg" />
                      <p>{item.customer_name}</p>
                      <p className="card_mobile_no">{item.mobile_number}</p>
                      <p className="card_engine_no">{item.engine_number}</p>
                      <p className="card_chassis_no">{item.chassis_number}</p>
                    </div>
                    {/* <img
                      src={chat}
                      alt="Logo"
                      onClick={() => {
                        navigate("/chat", {
                          state: { escdata: item },
                        });
                      }}
                      className="chatICon"
                    /> */}
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
                        marginTop: "38px",
                      }}
                    >
                      <img
                        src={supportAgent}
                        alt="Logo"
                        className="supporticon"
                      />
                      <p className="tobabel"> {item.to_name}</p>
                    </span>

                    <p className="cardic_name">IC Name:{item.rsa_ic_name}</p>

                    <p className="creationdate">
                      JOB crt:{" "}
                      {new Date(item.job_create_date).toLocaleString("en-US", {
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




            
            }
                    </>}
            

          
        </div></>
        
        }
      </div>


      
     {recentList.length!==0&& <div className="scrollable-container recentContainer onlyDesktop"> <div className="card-container">
      <div onClick={()=>{localStorage.removeItem("recentList");setrecentList([])} } style={{backgroundColor:'#c5bcbc',borderRadius:'25px'}}><p style={{color:'white',margin:'5px',marginLeft:'10px',marginRight:'10px',cursor:'pointer'}}>X  Clear Recent Views</p></div>
          
              {recentList?.map((item, index) => (
                <div
                className={`homecard ${item?.toBeRemoved ? 'slideOut' : ''}`}
                key={item.id}
                  style={{
                    backgroundColor:
                      item?.esclation_sub_type !== "icpl_sales"
                        ? "#ffe6e6"
                        : "",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      margin:'5px'
                    }}
                  >
                    <div>
                    <img
                        src={Close2}
                        onClick={() => handleRemoveItem(item?.id)}

                        alt="Logo"
                        style={{ cursor: "pointer" ,position:'absolute',right:-15,top:-5}}
                        className="viewData"
                      />
                      <p className="jobid">#{item?.jobid}</p>
                      <p className="escalatedby">by {item?.from_name}</p>
                    </div>
                    <div style={{ flexDirection: "row", display: "flex" }}>
                      <img
                        src={ViewData}
                        onClick={() => {
                          handleSearch("ViewDocument", item?.jobid);
                        }}
                        alt="Logo"
                        style={{ cursor: "pointer" }}
                        className="viewData"
                      />
                      <p
                        className="statustag"
                        style={{
                          backgroundColor:
                            item?.esclation_status === "Pending"
                              ? "#e54a50" // Pending color
                              : item?.esclation_status === "WIP"
                              ? "#eec75b" // WIP color
                              : item?.esclation_status === "Resolved"
                              ? "#5d9db9" // Resolved color
                              : item?.esclation_status === "Accepted"
                              ? "#6fb293" // Accepted color
                              : item?.esclation_status === "Reopen"
                              ? "#d7Oe17" // Reopen color
                              : "white", // Default color for other cases
                        }}
                      >
                        {item?.esclation_status}
                      </p>
                      <p
                        style={{
                          position: "absolute",
                          fontSize: "12px",
                          top: "40px",
                          right: "15px",
                        }}
                      >
                        {timeDifference[index]}
                      </p>
                    </div>
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
                      <img src={ChassisImg} alt="Logo" className="chassisImg" />
                      <img src={PhoneImg} alt="Logo" className="phoneImg" />
                      <img src={EngineImg} alt="Logo" className="engineImg" />
                      <p>{item?.customer_name}</p>
                      <p className="card_mobile_no">{item?.customer_mobile_no}</p>
                      <p className="card_engine_no">{item?.engine_number}</p>
                      <p className="card_chassis_no">{item?.frame_no}</p>
                    </div>
                    {/* <img
                      src={chat}
                      alt="Logo"
                      onClick={() => {
                        navigate("/chat", {
                          state: { escdata: item },
                        });
                      }}
                      className="chatICon"
                    /> */}
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
                        marginTop: "38px",
                      }}
                    >
                      <img
                        src={supportAgent}
                        alt="Logo"
                        className="supporticon"
                      />
                      <p className="tobabel"> {item?.to_name}</p>
                    </span>

                    <p className="cardic_name">IC Name:{item?.rsa_ic_name}</p>

                    <p className="creationdate">
                      JOB crt:{" "}
                      {new Date(item?.job_create_date).toLocaleString("en-US", {
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
            </div></div>}

         

      </div>
      
    </div>
  );
};

export default Home;
