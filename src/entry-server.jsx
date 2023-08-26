import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import "./index.scss";

import { Router } from "./Router";

export const render = ({ path }) => {
  return ReactDOMServer.renderToString(
    <StaticRouter location={path}>
      <Router />
    </StaticRouter>
  );
};