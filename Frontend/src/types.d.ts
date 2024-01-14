interface userDataInterface {
  id: string;
  uuid: string;
  avatar: string | undefined;
  username: string;
  stats: string | undefined;
  roles: string[];
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
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
