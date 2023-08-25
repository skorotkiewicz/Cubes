import { Outlet, Link, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  const current = (url) => {
    if (location.pathname === url) {
      return "current";
    }
  };

  return (
    <div>
      <nav>
        <ul>
          <li className={current("/")}>
            <Link to="/">Home</Link>
          </li>
          <li className={`${current("/cubes") ?? ""} rainbow`}>
            <Link to="/cubes">Cubes</Link>
          </li>
          <li className={`${current("/multicubes") ?? ""} rainbow`}>
            <Link to="/multicubes">MultiCubes</Link>
          </li>
          <li className={current("/about")}>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav>

      <hr />

      <Outlet />
    </div>
  );
}
