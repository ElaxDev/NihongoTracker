interface userDataInterface {
  id: Types.ObjectId;
  uuid: string;
  avatar: string | undefined;
  username: string;
  stats: Types.ObjectId | undefined;
  roles: string[];
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
}

export enum REDUCER_ACTION_TYPE {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAILURE,
}

export interface userInterface {
  userData: userDataInterface | null;
  accessToken: string;
  newUser: boolean;
}

export interface authInterface {
  user?: userInterface;
  loggedIn: boolean;
  isLoading: boolean;
  error?: string;
}
