import makeApiRequest from "./apiCaller";

export const IndividualesclationListAPI = async (job_id) => {
  try {
    const body = new URLSearchParams();
    body.append("job_id", job_id);

    const result = await makeApiRequest(
      "IndividualesclationList",
      "POST",
      body
    );
    const data = JSON.parse(result);

    return data;
  } catch (error) {
    // Handle errors
    console.log(error);
  }
};
