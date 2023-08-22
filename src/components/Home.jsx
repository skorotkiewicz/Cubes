import { useAtom } from "react-atomize-store";

const Home = () => {
  const [text] = useAtom("text");
  const [select, setSelect] = useAtom("select");
  const [cubes, setCubes] = useAtom("cubes");

  const data = [{ m: 1 }, { m: 2 }, { m: 3 }, { m: 4 }];

  const selectCube = (id) => {
    if (cubes?.includes(id)) {
      setCubes(cubes.filter((cube) => cube !== id));
    } else {
      setCubes((prev) => [...prev, id]);
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
            className={`h ${cubes?.includes(i) ? "selected" : ""}`}
            onClick={() => selectCube(i)}
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
