import makeApiRequest from "./apiCaller";

export const searchEscalationData = async (params, value,userid) => {
  try {
    const body = new URLSearchParams();
    body.append("type", params);
    body.append("value", value);
    body.append("user_id", userid);


    const result = await makeApiRequest("searchData", "POST", body);
    const data = JSON.parse(result);

    return data;
  } catch (error) {
    // Handle errors
    console.log(error);
  }
};
