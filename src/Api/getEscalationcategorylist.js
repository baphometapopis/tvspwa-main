import makeApiRequest from "./apiCaller";

export const getEscalationCataegoryList = async () => {
  try {
    // const body = new URLSearchParams();
    // body.append("email_id", email_id);
    // body.append("password", password);

    const result = await makeApiRequest("categoryList", "GET");
    const data = JSON.parse(result);

    return data;
  } catch (error) {
    // Handle errors
    console.log(error);
  }
};
