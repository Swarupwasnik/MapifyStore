import axios from 'axios';

const retryFetch = async (url, options, retries = 5, delay = 1000) => {
  try {
    console.log(`Fetching URL: ${url}, Retries left: ${retries}, Delay: ${delay}`);
    const response = await axios.get(url, options);
    return response;
  } catch (err) {
    if (err.response?.status === 429 && retries > 0) {
      const retryAfter = err.response.headers['retry-after'];
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay;
      console.log(`Rate limit hit. Waiting ${waitTime} ms before retrying...`);
      await new Promise(res => setTimeout(res, waitTime));
      return retryFetch(url, options, retries - 1, delay * 2); // Exponential backoff
    }
    throw err;
  }
};

export default retryFetch;

