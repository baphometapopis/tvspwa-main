import makeApiRequest from "./apiCaller";

export const makerAction = async (data) => {
  try {
    const body = new URLSearchParams();
    body.append("esclated_by_comment", data?.esclated_to_comment);
    body.append("esclation_status", data?.esclation_status);
    body.append("esclation_id", data?.esclation_id);
    body.append("user_id", data?.user_id);

    const result = await makeApiRequest("MakerAction", "POST", body);
    const resdata = JSON.parse(result);
    return resdata;
  } catch (error) {
    // Handle errors
    console.log(error);
  }
};
