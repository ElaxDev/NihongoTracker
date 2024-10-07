import axios from 'axios';
import {
  ILoginResponse,
  IRegisterInput,
  ILoginInput,
  updateLogRequest,
  createLogRequest,
  ILog,
  IUser,
  IRankingResponse,
  IRankingParams,
  ILogsParams,
  IAnimeDocument,
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

export async function updateUserFn(updateValues: FormData) {
  const { data } = await api.put<IUser>(`/users`, updateValues, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

export async function clearUserDataFn() {
  const { data } = await api.post(`users/cleardata`);
  return data;
}

export async function getRankingFn(params?: IRankingParams) {
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

export async function getAnimesFn() {
  const { data } = await api.get<
    Pick<IAnimeDocument, '_id' | 'title' | 'synonyms'>[]
  >(`media/anime`);
  return data;
}

export async function searchAnimeFn(params: { title: string }) {
  const { data } = await api.get<IAnimeDocument[]>(`media/search-anime`, {
    params,
  });
  return data;
}

export async function assignMediaFn(logsId: string[], mediaId: string) {
  const { data } = await api.put(`logs/assign-media`, {
    logsId,
    mediaId,
  });
  return data;
}

export async function getUserLogsFn(username: string, params?: ILogsParams) {
  const { data } = await api.get<ILog[]>(`users/${username}/logs`, { params });
  return data;
}

export async function createLogFn(logValues: createLogRequest) {
  const { data } = await api.post<ILog>(`logs`, logValues);
  return data;
}

export async function deleteLogFn(id: string) {
  const { data } = await api.delete(`logs/${id}`);
  return data;
}

export async function importLogsFn() {
  const { data } = await api.get(`logs/importlogs`);
  return data;
}
