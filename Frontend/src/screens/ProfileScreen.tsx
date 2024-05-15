import { useNavigate, useParams } from 'react-router-dom';
// import { useUserDataStore } from '../store/userData';
import { getUserFn, getUserLogsFn } from '../api/authApi';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import ProfileNavbar from '../components/ProfileNavbar';
import LogCard from '../components/LogCard';
import ProgressBar from '../components/ProgressBar';

function ProfileScreen() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const {
    data: user,
    error: userError,
    isLoading: isLoadingUser,
  } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUserFn(username as string),
  });

  if (userError) {
    if (userError instanceof AxiosError) {
      if (userError.status === 404) navigate('/404', { replace: true });
      toast.error(userError.response?.data.message);
    } else {
      toast.error(userError.message ? userError.message : 'An error occurred');
    }
  }

  const { data: logs } = useQuery({
    queryKey: ['logs', username],
    queryFn: () => getUserLogsFn(username as string),
  });

  const totalXPToLevelUp = user?.stats.userXpToNextLevel
    ? user?.stats.userXpToNextLevel - user?.stats.userXpToCurrentLevel
    : 0;
  const userProgressXP = user?.stats.userXp
    ? user?.stats.userXp - user?.stats.userXpToCurrentLevel
    : 0;
  const progressPercentage = (userProgressXP / totalXPToLevelUp) * 100;

  return (
    <div className="flex flex-col justify-center">
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

        {isLoadingUser && <Loader />}
      </div>
      <ProfileNavbar username={user?.username} />
      <div className="flex flex-col items-center">
        <div className="2xl:max-w-screen-2xl 2xl:min-w-[50%] min-w-full">
          <div className="grid grid-cols-2 gap-10">
            <div className="">
              <p className="font-bold text-xl">
                Level: {user?.stats.userLevel}
              </p>
              <p className="font-bold text-xl">XP: {userProgressXP}</p>
              <p className="font-bold text-xl">
                XP to next level: {totalXPToLevelUp}
              </p>
              <ProgressBar progress={progressPercentage} maxProgress={100} />
            </div>
            <div className="grid gap-3 pt-4">
              {logs?.map((log) => (log ? <LogCard log={log} /> : null))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;
