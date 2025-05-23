import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUserFn } from '../api/trackerApi';
import { useMutation } from '@tanstack/react-query';
import { ILoginResponse } from '../types';
import { useUserDataStore } from '../store/userData';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import Loader from '../components/Loader';

function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const { setUser } = useUserDataStore();
  const navigate = useNavigate();

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: registerUserFn,
    onSuccess: (data: ILoginResponse) => {
      setUser(data);
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error(error.message ? error.message : 'An error occurred');
      }
    },
  });

  async function submitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutate({ username, password, passwordConfirmation });
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success('Login successful');
      navigate('/'); // Redirect to home page
    }
  }, [navigate, isSuccess]);

  return (
    <div className="relative">
      <div className="h-screen flex justify-center items-center bg-base-200">
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={submitHandler}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
                <input
                  type="text"
                  placeholder="Username"
                  className="grow"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password Confirmation</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="password"
                  placeholder="Password confirmation"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="grow"
                  required
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="grow"
                  required
                />
              </label>
              <label className="label">
                <Link to="/login" className="label-text-alt link link-hover">
                  Are you already registered?
                </Link>
              </label>
            </div>
            <div className="form-control flex justify-center mt-6">
              <button className="btn btn-primary" type="submit">
                Register
              </button>
            </div>
          </form>
          {isPending && <Loader />}
        </div>
      </div>
    </div>
  );
}

export default RegisterScreen;
