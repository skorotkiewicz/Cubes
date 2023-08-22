const Tools = ({ currentColor, setCurrentColor }) => {
  const colors = [
    "#ff4500",
    "#ffa800",
    "#ffd635",
    "#00cc78",
    "#7eed56",
    "#2450a4",
    "#3690ea",
    "#51e9f4",
    "#811e9f",
    "#b44ac0",
    "#ff99aa",
    "#9c6926",
    "#000000",
    "#898d90",
    "#d4d7d9",
    "#ffffff",
  ];

  return (
    <div className="tools">
      {colors.map((c, key) => (
        <div
          key={key}
          style={{ backgroundColor: c }}
          className={`color ${currentColor === c ? "select" : ""}`}
          onClick={() => setCurrentColor(c)}
        >
          &nbsp;
        </div>
      ))}
    </div>
  );
};

export default Tools;
