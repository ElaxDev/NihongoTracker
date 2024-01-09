import axios from '../api/axios';
import { useAuthContext } from './useAuthContext';

function useRefreshToken() {
  async function getRefreshToken() {
    const response = await axios.get('/api/auth/refresh', {
      withCredentials: true,
    });
  }
  return <div></div>;
}

export default useRefreshToken;
