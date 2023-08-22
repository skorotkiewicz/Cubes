import { useState } from "react";
import { useAtom } from "react-atomize-store";
import Tools from "./Tools";

const Cubes = () => {
  const [cubes, setCubes] = useAtom("cubes");
  const [currentColor, setCurrentColor] = useState("#ffffff");
  const [grid, setGrid] = useState(true);

  const selectCube = (id) => {
    if (cubes && cubes[id]) {
      setCubes((prev) => {
        const newCubes = { ...prev };
        delete newCubes[id];
        return newCubes;
      });
    } else {
      setCubes((prev) => ({
        ...prev,
        [id]: currentColor,
      }));
    }
  };

  return (
    <div>
      <div className={`cube${grid ? " grid" : ""}`}>
        {new Array(100).fill().map((_, i) => (
          <div
            key={i}
            className="h"
            style={{ backgroundColor: cubes && cubes[i] }}
            onClick={() => selectCube(i)}
          >
            &nbsp;
          </div>
        ))}
      </div>

      <Tools setCurrentColor={setCurrentColor} />

      <div className="btn">
        <button onClick={() => setGrid((prev) => !prev)}>Grid</button>
        <button
          onClick={() => {
            if (confirm("Clear cubes?")) {
              setCubes([]);
            }
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default Cubes;