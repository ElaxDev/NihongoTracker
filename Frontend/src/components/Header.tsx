import { Link, useNavigate } from 'react-router-dom';
import { MdLogout, MdPerson, MdSettings } from 'react-icons/md';
import { useUserDataStore } from '../store/userData';
import { useMutation } from '@tanstack/react-query';
import { logoutUserFn } from '../api/trackerApi';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { logoutResponseType } from '../types';
import Loader from './Loader';
import QuickLog from './QuickLog';
import { IconContext } from 'react-icons';

function Header() {
  const { user, logout } = useUserDataStore();
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: logoutUserFn,
    onSuccess: (data: logoutResponseType) => {
      logout();
      useUserDataStore.persist.clearStorage();
      toast.success(data.message);
      navigate('/');
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error(error.message ? error.message : 'An error occurred');
      }
    },
  });

  function logoutHandler(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    mutate();
  }

  return (
    <div className="relative">
      <div className="navbar transition duration-200 bg-neutral/85 hover:bg-neutral/100 text-neutral-content absolute w-full z-40 max-h-32">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            {user ? (
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow rounded-box w-52"
              >
                <li>
                  <QuickLog />
                </li>
              </ul>
            ) : (
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/features">Features</Link>
                </li>
              </ul>
            )}
          </div>
          <Link className="btn btn-ghost text-xl" to="/">
            NihongoTracker
          </Link>
        </div>
        {user ? (
          <div className="hidden lg:inline-flex">
            {/* <QuickLog /> */}
            <Link
              className="group transition duration-300 relative"
              to="/ranking"
            >
              Ranking
              <span className="block w-full h-0.5 bg-primary absolute bottom-0 left-1/2 transform -translate-x-1/2 group-hover:scale-x-100 transition-transform duration-500 scale-x-0"></span>
            </Link>
          </div>
        ) : (
          <div className="navbar-center hidden lg:flex">
            <ul className="inline-flex flex-row gap-4">
              <li>
                <Link className="group transition duration-300 relative" to="/">
                  Home
                  <span className="block w-full h-0.5 bg-primary absolute bottom-0 left-1/2 transform -translate-x-1/2 group-hover:scale-x-100 transition-transform duration-500 scale-x-0"></span>
                </Link>
              </li>
              <li>
                <Link
                  className="group transition duration-300 relative"
                  to="/features"
                >
                  Features
                  <span className="block w-full h-0.5 bg-primary absolute bottom-0 left-1/2 transform -translate-x-1/2 group-hover:scale-x-100 transition-transform duration-500 scale-x-0"></span>
                </Link>
              </li>
            </ul>
          </div>
        )}

        <div className="navbar-end gap-3 mx-3">
          {user ? (
            <>
              <Link className="btn btn-primary" to="/createlog">
                Create Log
              </Link>
              <div className="dropdown dropdown-hover dropdown-bottom dropdown-end">
                <div tabIndex={0} role="button" className="btn m-1">
                  {user.username}
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 text-base-content rounded-box w-52"
                >
                  <IconContext.Provider
                    value={{ className: 'text-lg currentColor' }}
                  >
                    <li>
                      <Link to={`/user/${user.username}`}>
                        <MdPerson />
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link to={`/settings`}>
                        <MdSettings />
                        Settings
                      </Link>
                    </li>
                    <li>
                      <a onClick={logoutHandler}>
                        <MdLogout />
                        Logout
                      </a>
                    </li>
                  </IconContext.Provider>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Link className="btn btn-primary" to="/login">
                Sign In
              </Link>
              <Link className="btn btn-primary btn-outline" to="/register">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      {isPending && <Loader />}
    </div>
  );
}

export default Header;
