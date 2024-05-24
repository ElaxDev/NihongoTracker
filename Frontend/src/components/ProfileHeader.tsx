import ProfileNavbar from './ProfileNavbar';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { getUserFn } from '../api/authApi';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useProfileDataStore } from '../store/profileData';
import { useEffect } from 'react';
import Loader from './Loader';

function ProfileHeader() {
  const { username } = useParams<{ username: string }>();
  const { setProfile } = useProfileDataStore();
  const navigate = useNavigate();

  const {
    data: user,
    error: userError,
    isLoading: isLoadingUser,
  } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUserFn(username as string),
    staleTime: Infinity,
  });

  if (userError) {
    if (userError instanceof AxiosError) {
      if (userError.status === 404) navigate('/404', { replace: true });
      toast.error(userError.response?.data.message);
    } else {
      toast.error(userError.message ? userError.message : 'An error occurred');
    }
  }

  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user, setProfile]);

  return (
    <div className="flex flex-col justify-center bg-base-200">
      <div className="flex flex-col h-96 min-w-80 px-5 2xl:max-w-screen-2xl 2xl:px-24 justify-end mx-auto w-full">
        <div className="flex items-end w-full mb-2">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-24">
              <span className="text-3xl">
                {user?.username[0].toUpperCase()}
              </span>
            </div>
          </div>
          <div className="py-22px px-25px">
            <h1 className="text-xl font-bold inline-block">{user?.username}</h1>
          </div>
        </div>
      </div>
      {isLoadingUser && <Loader />}

      <ProfileNavbar username={user?.username} />
      <Outlet />
    </div>
  );
}

export default ProfileHeader;
