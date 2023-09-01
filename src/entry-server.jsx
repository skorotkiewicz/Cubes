import "./App.scss";
import ReactDOMServer from "react-dom/server";

import App from "./App.jsx";

export const render = ({ path }) => {
  return ReactDOMServer.renderToString(<App />);
};
