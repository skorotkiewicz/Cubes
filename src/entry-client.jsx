import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.scss";

import { Router } from "./Router";

ReactDOM.hydrateRoot(
  document.querySelector("#root"),
  <BrowserRouter>
    <Router />
  </BrowserRouter>
);
