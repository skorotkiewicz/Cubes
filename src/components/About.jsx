const About = () => {
  return (
    <div>
      <h1>Hi!</h1>

      <div>
        This site is open-source!{" "}
        <a
          target="_blank"
          href="https://github.com/skorotkiewicz/JustFun/tree/SSR"
          rel="noreferrer"
        >
          GitHub
        </a>
        <div>
          It use Supabase to save current state of cubes and it&apos;s build in
          React with SSR.
        </div>
      </div>
    </div>
  );
};

export default About;
