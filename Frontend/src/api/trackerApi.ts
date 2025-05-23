import axios from 'axios';
import {
  ILoginResponse,
  IRegisterInput,
  ILoginInput,
  updateLogRequest,
  ICreateLog,
  ILog,
  IUser,
  IRankingResponse,
  IRankingParams,
  ILogsParams,
  IMediaDocument,
  IImmersionList,
  IAverageColor,
} from '../types';

const BASE_URL = '/api/';
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

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

export async function searchMediaFn(params: {
  type: string;
  search: string;
  ids?: number[];
  page?: number;
  perPage?: number;
}): Promise<IMediaDocument[]> {
  const { data } = await api.get<IMediaDocument[]>(`media/search`, {
    params,
  });
  return data || [];
}

export async function getMediaFn(
  mediaId?: string,
  mediaType?: string
): Promise<IMediaDocument> {
  const { data } = await api.get<IMediaDocument>(
    `media/${mediaType}/${mediaId}`
  );
  return data;
}

interface IAssignData {
  logsId: string[];
  contentMedia: IMediaDocument;
}

export async function assignMediaFn(assignData: Array<IAssignData>) {
  const { data } = await api.put(`logs/assign-media`, assignData);
  return data;
}

export async function getUserLogsFn(username: string, params?: ILogsParams) {
  const { data } = await api.get<ILog[]>(`users/${username}/logs`, { params });
  return data;
}

export async function createLogFn(logValues: ICreateLog) {
  const { data } = await api.post<ILog>(`logs`, logValues);
  return data;
}

export async function deleteLogFn(id: string) {
  const { data } = await api.delete(`logs/${id}`);
  return data;
}

export async function importLogsFn(forced: boolean) {
  const { data } = await api.post(`logs/importlogs`, { forced });
  return data;
}

export async function getImmersionListFn(username: string) {
  const { data } = await api.get<IImmersionList>(
    `users/${username}/immersionlist`
  );
  return data;
}

export async function getAverageColorFn(imageUrl?: string) {
  if (!imageUrl) return null;
  const { data } = await api.get<IAverageColor>(`media/utils/avgcolor`, {
    params: { imageUrl },
  });
  return data;
}

export async function getUntrackedLogsFn() {
  const { data } = await api.get<ILog[]>(`logs/untrackedlogs`);
  return data;
}
