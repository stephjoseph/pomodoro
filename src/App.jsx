import { useState, useEffect, useRef } from "react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import iconSettings from "/assets/icon-settings.svg";

function App() {
  const [isPaused, setIsPaused] = useState(true);
  const [mode, setMode] = useState("pomodoro"); // pomodoro/shortBreak/null
  const [secondsLeft, setSecondsLeft] = useState(0.1 * 60);
  const [cycleCount, setCycleCount] = useState(3); // New state for cycle count

  const secondsLeftRef = useRef(secondsLeft);
  const isPausedRef = useRef(isPaused);
  const modeRef = useRef(mode);

  const tick = () => {
    secondsLeftRef.current--;
    setSecondsLeft(secondsLeftRef.current);
  };

  const togglePause = () => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
    isPausedRef.current = !isPausedRef.current;

    if (isPaused && cycleCount === 4 && mode === "pomodoro") {
      // Reset back to pomodoro time
      setSecondsLeft(0.1 * 60);
      secondsLeftRef.current = 0.1 * 60;

      // Reset cycle count
      setCycleCount(0);
    }
  };

  useEffect(() => {
    function switchMode() {
      let nextMode;
      let nextSeconds;

      if (modeRef.current === "pomodoro") {
        nextMode = "shortBreak";
      } else if (modeRef.current === "shortBreak" && cycleCount === 4) {
        nextMode = "longBreak";
      } else {
        nextMode = "pomodoro";
      }

      if (nextMode === "pomodoro") {
        nextSeconds = 0.1 * 60;
      } else if (nextMode === "shortBreak") {
        nextSeconds = 0.05 * 60;
      } else {
        nextSeconds = 0.2 * 60;
      }

      setMode(nextMode);
      modeRef.current = nextMode;

      setSecondsLeft(nextSeconds);
      secondsLeftRef.current = nextSeconds;

      if (cycleCount === 4 && nextMode === "pomodoro") {
        togglePause();
        setSecondsLeft(0);
        secondsLeftRef.current = 0;
      }

      // Increment cycle count on short break
      if (nextMode === "shortBreak") {
        setCycleCount((prevCycleCount) => prevCycleCount + 1);
      }
    }

    const interval = setInterval(() => {
      if (isPausedRef.current) {
        return;
      }
      if (secondsLeftRef.current === 0) {
        return switchMode();
      }

      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [cycleCount]);

  const totalSeconds =
    mode === "pomodoro"
      ? 0.1 * 60
      : mode === "shortBreak"
        ? 0.05 * 60
        : 0.2 * 60;
  const percentage =
    isPaused && cycleCount === 4 && mode === "pomodoro"
      ? 100
      : (secondsLeft / totalSeconds) * 100;

  let minutes = Math.floor(secondsLeft / 60);
  let seconds = secondsLeft % 60;
  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;

  return (
    <>
      <header className="w-full py-8">
        <h1 className="text-center text-2xl font-bold leading-[1.875rem] tracking-normal text-light-grey">
          pomodoro
        </h1>
      </header>
      <main className="flex w-full flex-col items-center gap-20 px-6">
        <div className="flex w-full max-w-[327px] flex-col items-center gap-12">
          <div className="flex w-full rounded-[32px] bg-midnight-navy p-2">
            <div
              className={`flex-1 rounded-3xl  py-4 text-center text-xs font-bold leading-[0.938rem] tracking-normal transition-colors duration-300  ${mode === "pomodoro" ? "bg-salmon text-midnight-blue" : "bg-transparent text-light-grey/40"}`}
            >
              pomodoro
            </div>
            <div
              className={`flex-1 rounded-3xl  py-4 text-center text-xs font-bold leading-[0.938rem] tracking-normal transition-colors duration-300  ${mode === "shortBreak" ? "bg-salmon text-midnight-blue" : "bg-transparent text-light-grey/40"}`}
            >
              short break
            </div>
            <div
              className={`flex-1 rounded-3xl  py-4 text-center text-xs font-bold leading-[0.938rem] tracking-normal transition-colors duration-300  ${mode === "longBreak" ? "bg-salmon text-midnight-blue" : "bg-transparent text-light-grey/40"}`}
            >
              long break
            </div>
          </div>
          <div className="h-[18.75rem] w-[18.75rem] rounded-full bg-gradient-to-br from-[#0E112A] to-[#2E325A] p-4 shadow-[0_-50px_-50px_100px_rgba(39,44,90,1),_0_50px_50px_100px_rgba(18,21,48,1)]">
            <div className="h-full w-full rounded-full bg-midnight-navy p-[0.625rem]">
              <CircularProgressbarWithChildren
                value={percentage}
                strokeWidth={4}
                styles={buildStyles({
                  // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                  strokeLinecap: "round",

                  // How long animation takes to go from one percentage to another, in seconds
                  pathTransitionDuration: 0.5,

                  // Can specify path transition in more detail, or remove it entirely
                  // pathTransition: 'none',

                  // Colors
                  pathColor: "#F87070",
                  trailColor: "#161932",
                  backgroundColor: "#161932",
                })}
              >
                <div className="mt-3 flex flex-col items-center gap-2">
                  <span className="text-[5rem] font-bold leading-[6.188rem] tracking-[-4px] text-light-grey">
                    {minutes + ":" + seconds}
                  </span>
                  <button
                    className="flex items-center justify-center"
                    type="button"
                    onClick={togglePause}
                  >
                    <span className="ml-3 w-full text-center text-[0.875rem] font-bold uppercase leading-[1.063rem] tracking-[13.13px]">
                      {isPaused
                        ? cycleCount === 4 && mode === "pomodoro"
                          ? "restart"
                          : "start"
                        : "pause"}
                    </span>
                  </button>
                </div>
              </CircularProgressbarWithChildren>
            </div>
          </div>
        </div>
        <button className="h-7 w-7">
          <img
            className="h-full w-full object-cover"
            src={iconSettings}
            alt="settings icon"
          />
        </button>
      </main>
    </>
  );
}

export default App;
