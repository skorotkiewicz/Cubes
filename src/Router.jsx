import "./App.scss";
import { Routes, Route } from "react-router-dom";

import Layout from "./Layout";
import Home from "./components/Home";
import About from "./components/About";
import Cubes from "./components/Cubes";
import MultiCubes from "./components/MultiCubes";
import NoMatch from "./components/NoMatch";

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="cubes" element={<Cubes />} />
        <Route path="multicubes" element={<MultiCubes />} />
        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
  );
}