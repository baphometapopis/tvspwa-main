import makeApiRequest from "./apiCaller";

export const raiseEscalation = async (data) => {
  try {
    const body = new URLSearchParams();
    body.append("esclated_by_category_id", data?.esclated_by_category_id);
    body.append("job_id", data?.job_id);
    body.append("user_id", data?.user_id);
    body.append("esclated_by_comment", data?.esclated_by_comment);

    
    const result = await makeApiRequest("raiseEscalation", "POST", body);
    const resdata = JSON.parse(result);

    return resdata;
  } catch (error) {
    // Handle errors
    console.log(error);
  }
};
