import { Link } from 'react-router-dom';

function ProfileNavbar({ username }: { username: string | undefined }) {
  return (
    <div className="navbar min-h-12 bg-base-200">
      <div className="mx-auto">
        <ul className="menu menu-horizontal gap-5">
          <li>
            <Link to={`/user/${username}/stats`}>Stats</Link>
          </li>
          <li>
            <a>Link</a>
          </li>
          <li>
            <a>Link</a>
          </li>
          <li>
            <a>Link</a>
          </li>
          <li>
            <a>Link</a>
          </li>
          <li>
            <a>Link</a>
          </li>
          <li>
            <a>Link</a>
          </li>
          <li>
            <a>Link</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ProfileNavbar;
