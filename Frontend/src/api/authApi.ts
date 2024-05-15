import axios from 'axios';
import {
  ILoginResponse,
  IRegisterInput,
  ILoginInput,
  filterTypes,
  updateUserRequest,
  updateLogRequest,
  createLogRequest,
  ILog,
  IUser,
  IRankingResponse,
} from '../types';

const BASE_URL = '/api/';
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// authApi.defaults.headers.common['Content-Type'] =
//   'application/x-www-form-urlencoded';

export async function registerUserFn(
  user: IRegisterInput
): Promise<ILoginResponse> {
  const userParams = Object.entries(user).reduce((params, [key, value]) => {
    params.append(key, value);
    return params;
  }, new URLSearchParams());

  const { data } = await api.post<ILoginResponse>('auth/register', userParams);
  return data;
}

export async function loginUserFn(user: ILoginInput): Promise<ILoginResponse> {
  const userParams = Object.entries(user).reduce((params, [key, value]) => {
    params.append(key, value);
    return params;
  }, new URLSearchParams());

  const { data } = await api.post<ILoginResponse>('auth/login', userParams);
  return data;
}

export async function logoutUserFn() {
  const { data } = await api.post('auth/logout');
  return data;
}

export async function getUserFn(username: string): Promise<IUser> {
  const { data } = await api.get<IUser>(`users/${username}`);
  return data;
}

export async function updateUserFn(updateValues: updateUserRequest) {
  const updateParams = Object.entries(updateValues).reduce(
    (params, [key, value]) => {
      params.append(key, value);
      return params;
    },
    new URLSearchParams()
  );

  const { data } = await api.put<IUser>(`/users`, updateParams);
  return data;
}

export async function getRankingFn(params: filterTypes) {
  const { data } = await api.get<IRankingResponse[]>(`users/ranking`, {
    params,
  });
  return data;
}

export async function getLogFn(id: string) {
  const { data } = await api.get<ILog>(`logs/${id}`);
  return data;
}

export async function updateLogFn(id: string, updateValues: updateLogRequest) {
  const updateParams = Object.entries(updateValues).reduce(
    (params, [key, value]) => {
      params.append(key, value);
      return params;
    },
    new URLSearchParams()
  );

  const { data } = await api.put<ILog>(`logs/${id}`, updateParams);
  return data;
}

export async function getUserLogsFn(username: string) {
  const { data } = await api.get<ILog[]>(`users/${username}/logs`);
  return data;
}

export async function createLogFn(logValues: createLogRequest) {
  const { data } = await api.post<ILog>(`logs`, logValues);
  return data;
}
