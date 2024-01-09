interface userDataInterface {
  uuid: string;
  avatar: string;
  username: string;
  createdAt: number;
  updatedAt: number;
}

export interface userInterface {
  userData: userDataInterface | null;
  newUser: boolean;
}

export interface authInterface {
  user?: userInterface;
  loggedIn: boolean;
  isLoading: boolean;
  error?: string;
}
