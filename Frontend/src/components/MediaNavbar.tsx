import { Link } from 'react-router-dom';

function MediaNavbar({ mediaName }: { mediaName: string | undefined }) {
  return (
    <div className="navbar min-h-12 bg-base-100">
      <div className="mx-auto">
        <ul className="menu menu-horizontal gap-5">
          <li>
            <Link to={`/media/${mediaName}/`}>Overview</Link>
          </li>
          <li>
            <Link to={`/media/${mediaName}/stats`}>Logs</Link>
          </li>
          <li>
            <Link to={`/media/${mediaName}/social`}>Social</Link>
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

export default MediaNavbar;
