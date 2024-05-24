import { useProfileDataStore } from '../store/profileData';

function StatsScreen() {
  const { user } = useProfileDataStore();
  const totalHours =
    user &&
    user.stats &&
    (user.stats.readingTime + user.stats.listeningTime) / 60;

  return (
    <div className="flex flex-row">
      <div>
        <h2>{user?.stats.userXp}</h2>
        <h4>Total XP</h4>
      </div>
      <div>
        <h2>{totalHours}h</h2>
        <h4>Total Hours</h4>
      </div>
      <div>
        <h2>{user?.stats.userXp}</h2>
        <h4>Total XP</h4>
      </div>
      <div>
        <h2>{user?.stats.userXp}</h2>
        <h4>Total XP</h4>
      </div>
    </div>
  );
}

export default StatsScreen;
