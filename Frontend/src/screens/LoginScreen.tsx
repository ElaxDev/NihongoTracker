import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUserFn } from '../api/trackerApi';
import { useMutation } from '@tanstack/react-query';
import { ILoginResponse } from '../types';
import { useUserDataStore } from '../store/userData';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import Loader from '../components/Loader';
import { validateUsername } from '../utils/validation';

function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ username: false, password: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { setUser } = useUserDataStore();
  const navigate = useNavigate();

  // Validate fields when touched
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (touched.username) {
      const usernameError = validateUsername(username);
      if (usernameError) {
        newErrors.username = usernameError;
      }
    }

    if (touched.password && !password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
  }, [username, password, touched]);

  const isFormValid = username.trim().length > 0 && password.length > 0;

  const handleFieldChange = (field: 'username' | 'password', value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === 'username') setUsername(value);
    if (field === 'password') setPassword(value);
  };

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: loginUserFn,
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

    // Mark all fields as touched for validation display
    setTouched({ username: true, password: true });

    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    mutate({ username: username.trim(), password });
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success('Login successful');
      navigate('/');
    }
  }, [navigate, isSuccess]);

  return (
    <div className="relative">
      <div className="h-screen flex justify-center items-center bg-base-200">
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={submitHandler}>
            <h2 className="text-2xl font-bold text-center mb-4">
              Welcome Back
            </h2>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                className={`input input-bordered ${
                  errors.username
                    ? 'input-error'
                    : touched.username && !errors.username && username
                      ? 'input-success'
                      : ''
                }`}
                value={username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                required
              />
              {errors.username && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.username}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className={`input input-bordered ${
                  errors.password
                    ? 'input-error'
                    : touched.password && !errors.password && password
                      ? 'input-success'
                      : ''
                }`}
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                required
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.password}
                  </span>
                </label>
              )}

              <label className="label">
                <Link to="/register" className="label-text-alt link link-hover">
                  Don't have an account?
                </Link>
              </label>
            </div>

            <div className="form-control flex justify-center mt-6">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={!isFormValid || isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Signing In...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
          {isPending && <Loader />}
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
