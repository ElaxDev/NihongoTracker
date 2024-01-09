import { useEffect, useContext, createContext, useReducer } from 'react';
import { authInterface, userInterface } from '../types';
import api from '../api/axios';

type AuthContextProps = {
  children: React.ReactNode;
};

interface contextInterface extends authInterface {
  dispatch: React.Dispatch<any>;
  logoutUser: Function;
}

const enum REDUCER_ACTION_TYPE {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
}

type actionType = {
  type: REDUCER_ACTION_TYPE;
  payload?: userInterface;
  error?: string;
};

export const AuthContext = createContext<contextInterface>(
  {} as contextInterface
);

export function useAuth(): authInterface {
  return useContext(AuthContext);
}

export function authReducer(
  state: authInterface,
  action: actionType
): authInterface {
  switch (action.type) {
    case REDUCER_ACTION_TYPE.LOGIN_REQUEST:
      return {
        loggedIn: false,
        isLoading: true,
      };
    case REDUCER_ACTION_TYPE.LOGIN_SUCCESS:
      return {
        user: action.payload,
        loggedIn: true,
        isLoading: false,
      };
    case REDUCER_ACTION_TYPE.LOGIN_FAILURE:
      return {
        loggedIn: false,
        isLoading: false,
        error: action.error,
      };
    case REDUCER_ACTION_TYPE.LOGOUT_REQUEST:
      return {
        loggedIn: false,
        isLoading: true,
      };
    case REDUCER_ACTION_TYPE.LOGOUT_SUCCESS:
      return {
        loggedIn: false,
        isLoading: false,
      };
    case REDUCER_ACTION_TYPE.LOGOUT_FAILURE:
      return {
        user: state.user,
        loggedIn: true,
        isLoading: false,
      };
    default:
      return state;
  }
}

export default function AuthContextProvider({
  children,
}: AuthContextProps): React.ReactElement {
  const [state, dispatch] = useReducer(authReducer, {
    user: undefined,
    loggedIn: false,
    isLoading: false,
  } as authInterface);

  async function loginUser(
    googleToken: google.accounts.id.CredentialResponse
  ): Promise<userInterface | undefined> {
    try {
      dispatch({ type: REDUCER_ACTION_TYPE.LOGIN_REQUEST });
      const authUser = await api.post(
        '/api/auth/google',
        {
          clientId: import.meta.env.VITE_CLIENT_ID,
          jwtToken: googleToken.credential,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      console.log(authUser.data);
      dispatch({
        type: REDUCER_ACTION_TYPE.LOGIN_SUCCESS,
        payload: authUser.data,
      });
      return authUser.data as userInterface;
    } catch (err) {
      if (err instanceof Error) {
        dispatch({
          type: REDUCER_ACTION_TYPE.LOGIN_FAILURE,
          error: err.message,
        });
      }
    }
  }

  async function logoutUser(): Promise<void> {
    try {
      dispatch({ type: REDUCER_ACTION_TYPE.LOGOUT_REQUEST });
      await api.post(
        '/api/auth/google',
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      dispatch({ type: REDUCER_ACTION_TYPE.LOGOUT_SUCCESS });
      return;
    } catch (err) {
      if (err instanceof Error) {
        dispatch({
          type: REDUCER_ACTION_TYPE.LOGOUT_FAILURE,
          error: err.message,
        });
      }
    }
  }

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: import.meta.env.ENV_CLIENT_ID,
      callback: loginUser,
    });

    google.accounts.id.renderButton(
      document.getElementById('signInDiv') as HTMLElement,
      { type: 'standard', theme: 'outline', size: 'large' }
    );
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
