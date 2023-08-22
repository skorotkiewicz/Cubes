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
      <div className={`cube${grid ? " grid" : " nogrid"}`}>
        {new Array(289).fill().map((_, i) => (
          <div
            key={i}
            style={{ backgroundColor: cubes && cubes[i] }}
            onClick={() => selectCube(i)}
          >
            &nbsp;
          </div>
        ))}
      </div>

      <Tools currentColor={currentColor} setCurrentColor={setCurrentColor} />

      <div className="btn">
        <button onClick={() => setGrid((prev) => !prev)}>
          {grid ? "Off Grid" : "On Grid"}
        </button>
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

      <details>
        <summary>Import / Export</summary>
        <strong>It&apos;s auto save.</strong>

        <textarea
          defaultValue={JSON.stringify(cubes)}
          cols="60"
          rows="15"
          onChange={(e) =>
            e.target.value && setCubes(JSON.parse(e.target.value))
          }
        ></textarea>
      </details>
    </div>
  );
};

export default Cubes;
