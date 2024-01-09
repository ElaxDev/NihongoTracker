import axios from 'axios';

export default axios.create({
  baseURL: import.meta.env.ENV_BACKEND_URL,
});
