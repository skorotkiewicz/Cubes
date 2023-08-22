import { useAtom } from "react-atomize-store";

const Dashboard = () => {
  const [text, setText] = useAtom("text");

  return (
    <div>
      <h2>Dashboard</h2>

      <input
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}
      />
    </div>
  );
};

export default Dashboard;
