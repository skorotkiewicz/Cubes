import { useAtom } from "react-atomize-store";

const Home = () => {
  const [text] = useAtom("text");

  return (
    <div>
      <h2>Home {text}</h2>
    </div>
  );
};

export default Home;
