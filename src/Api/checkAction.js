import makeApiRequest from "./apiCaller";

export const checkerAction = async (data) => {
  try {
    const body = new URLSearchParams();
    body.append("esclated_to_comment", data?.esclated_to_comment);
    body.append("esclation_status", data?.esclation_status);
    body.append("esclation_id", data?.esclation_id);
    body.append("user_id", data?.user_id);

    const result = await makeApiRequest("CheckAction", "POST", body);
    const resdata = JSON.parse(result);
    return resdata;
  } catch (error) {
    // Handle errors
    console.log(error);
  }
};
