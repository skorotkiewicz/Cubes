import { useState } from "react";
import { useAtom } from "react-atomize-store";
import Tools from "./Tools";

const Cubes = () => {
  const [cubes, setCubes] = useAtom("cubes");
  const [currentColor, setCurrentColor] = useState("#ffffff");
  const [grid, setGrid] = useState(true);
  const [size, setSize] = useState(17);

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

  const cubeSize = 25;
  const margin = 1;

  const rows = size;
  const cols = size;

  return (
    <div>
      <div
        className={`cube${grid ? " grid" : " nogrid"}`}
        style={{
          width: `${cols * (cubeSize + margin * 2)}px`,
        }}
      >
        {new Array(rows * cols).fill().map((_, i) => (
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

      <div className="boardsize">
        <span>Board size: {size}</span>
        <input
          type="range"
          defaultValue={17}
          min="5"
          max="40"
          onChange={(e) => setSize(e.target.value)}
        />
        <button onClick={() => setSize(17)}>Default</button>
      </div>

      <details>
        <summary>Import / Export</summary>
        <strong>It&apos;s auto save.</strong>
        <div>
          <textarea
            defaultValue={JSON.stringify(cubes)}
            cols="60"
            rows="15"
            onChange={(e) =>
              e.target.value && setCubes(JSON.parse(e.target.value))
            }
          ></textarea>
        </div>
      </details>
    </div>
  );
};

export default Cubes;
