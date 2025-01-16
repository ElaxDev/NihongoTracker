import { themeChange } from 'theme-change';
import { useEffect } from 'react';

function ThemeSwitcher() {
  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <div>
      <div className="dropdown w-full">
        <div tabIndex={0} role="button" className="btn w-full m-1 ">
          Theme
          <svg
            width="12px"
            height="12px"
            className="inline-block h-2 w-2 fill-current opacity-60"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
          >
            <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
          </svg>
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-2xl overflow-y-auto h-full min-h-72"
        >
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Default"
              data-set-theme="default"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Light"
              data-set-theme="light"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Dark"
              data-set-theme="dark"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Cupcake"
              data-set-theme="cupcake"
              data-act-class="ACTIVECLASS"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Bumblebee"
              data-set-theme="bumblebee"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Emerald"
              data-set-theme="emerald"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Corporate"
              data-set-theme="corporate"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Synthwave"
              data-set-theme="synthwave"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Retro"
              data-set-theme="retro"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Cyberpunk"
              data-set-theme="cyberpunk"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Valentine"
              data-set-theme="valentine"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Halloween"
              data-set-theme="halloween"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Garden"
              data-set-theme="garden"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Forest"
              data-set-theme="forest"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Aqua"
              data-set-theme="aqua"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Lofi"
              data-set-theme="lofi"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Pastel"
              data-set-theme="pastel"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Fantasy"
              data-set-theme="fantasy"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Wireframe"
              data-set-theme="wireframe"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Black"
              data-set-theme="black"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Luxury"
              data-set-theme="luxury"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Dracula"
              data-set-theme="dracula"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Cmyk"
              data-set-theme="cmyk"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Autumn"
              data-set-theme="autumn"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Business"
              data-set-theme="business"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Acid"
              data-set-theme="acid"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Lemonade"
              data-set-theme="lemonade"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Night"
              data-set-theme="night"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Coffee"
              data-set-theme="coffee"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Winter"
              data-set-theme="winter"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Dim"
              data-set-theme="dim"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Nord"
              data-set-theme="nord"
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="btn btn-sm btn-block btn-ghost justify-start"
              aria-label="Sunset"
              data-set-theme="sunset"
            />
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ThemeSwitcher;
