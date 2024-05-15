import { IconContext } from 'react-icons';
import { FaGithub } from 'react-icons/fa6';

function Footer() {
  return (
    <footer className="footer items-center p-4 bg-neutral text-neutral-content mt-auto fixed bottom-0 inset-x-0">
      <aside className="items-center grid-flow-col">
        <p>Copyright © 2024 - All right reserved</p>
      </aside>
      <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <IconContext.Provider value={{ className: 'text-3xl' }}>
          <a
            href="https://github.com/ElaxDev/NihongoTracker"
            target="_blank"
            rel="noreferrer"
          >
            <FaGithub />
          </a>
        </IconContext.Provider>
      </nav>
    </footer>
  );
}

export default Footer;
