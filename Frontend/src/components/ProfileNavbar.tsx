import { Link } from 'react-router-dom';

function ProfileNavbar({ username }: { username: string | undefined }) {
  return (
    <div className="navbar min-h-12 bg-base-100">
      <div className="mx-auto">
        <ul className="menu menu-horizontal gap-5">
          <li>
            <Link to={`/user/${username}/`}>Overview</Link>
          </li>
          <li>
            <Link to={`/user/${username}/stats`}>Stats</Link>
          </li>
          <li>
            <Link to={`/user/${username}/list`}>Immersion List</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ProfileNavbar;
