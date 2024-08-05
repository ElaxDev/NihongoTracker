import ProfileNavbar from './ProfileNavbar';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { getUserFn } from '../api/authApi';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { OutletContextType } from '../types';

export default function ProfileHeader() {
  const { username } = useParams<{ username: string }>();
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

  return (
    <div className="flex flex-col justify-center bg-base-300 text-base-content">
      <div
        className={`h-96 w-full bg-cover bg-center bg-no-repeat ${
          isLoadingUser ? 'skeleton' : ''
        }`}
        style={{
          backgroundImage: `url(${!isLoadingUser ? user?.banner : ''})`,
        }}
      >
        <div className="flex flex-col justify-end size-full bg-gradient-to-t from-shadow/[0.6] to-40% bg-cover">
          <div className="flex items-end min-w-80 px-5 2xl:max-w-screen-2xl 2xl:px-24 mx-auto w-full mb-2">
            {isLoadingUser ? (
              <div className="skeleton h-24 w-24 shrink-0 rounded-full"></div>
            ) : (
              <div className="avatar">
                <div className="w-24 rounded-full">
                  <img src={user?.avatar ? user.avatar : ''} />
                </div>
              </div>
            )}
            <div className="py-22px px-25px">
              <h1 className="text-xl font-bold inline-block text-slate-100">
                {user?.username}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <ProfileNavbar username={user?.username} />
      <Outlet context={{ user, username } satisfies OutletContextType} />
    </div>
  );
}
