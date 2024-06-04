import makeApiRequest from "./apiCaller";

export const escalationListApi = async (paramdata) => {
  try {
    const body = new URLSearchParams();
    body.append("user_id", paramdata?.user_id);
    body.append("end_date", paramdata?.end_date || "");
    body.append("start_date", paramdata?.start_date || "");
    body.append("status_id", paramdata?.status_id || "Pending");

    const result = await makeApiRequest("esclationList", "POST", body);
    const data = JSON.parse(result);

    return data;
  } catch (error) {
    // Handle errors
    console.log(error);
  }
};
