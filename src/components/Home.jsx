import { useState } from "react";
import { useAtom } from "react-atomize-store";
import Tools from "./Tools";

const Home = () => {
  const [text] = useAtom("text");
  const [select, setSelect] = useAtom("select");
  const [cubes, setCubes] = useAtom("cubes");
  const [currentColor, setCurrentColor] = useState("#ffffff");

  const data = [{ m: 1 }, { m: 2 }, { m: 3 }, { m: 4 }];

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
      <h2>Home {text && `[${text}]`}</h2>

      {data.map((value, key) => (
        <div className="select" key={key}>
          <label htmlFor={value.m}>{value.m}</label>
          <input
            type="radio"
            name="select"
            id={value.m}
            value={value.m}
            checked={select === value.m}
            onChange={(e) => setSelect(Number(e.target.value))}
          />
        </div>
      ))}

      <div className="cube">
        {new Array(100).fill().map((_, i) => (
          <div
            key={i}
            className="h"
            style={{ backgroundColor: cubes && cubes[i] }}
            onClick={() => selectCube(i)}
          >
            {/* {i} */}
            &nbsp;
          </div>
        ))}
      </div>

      <Tools setCurrentColor={setCurrentColor} />

      <button onClick={() => setCubes([])}>Clear</button>
    </div>
  );
};

export default Home;
