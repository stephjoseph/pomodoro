import { useState, useEffect, useRef } from "react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import iconSettings from "/assets/icon-settings.svg";
import iconClose from "/assets/icon-close.svg";
import iconArrowUp from "/assets/icon-arrow-up.svg";
import iconArrowDown from "/assets/icon-arrow-down.svg";
import iconCheck from "/assets/icon-check.svg";

function App() {
  const [isPaused, setIsPaused] = useState(true);
  const [mode, setMode] = useState("pomodoro"); // pomodoro/shortBreak/null
  const [secondsLeft, setSecondsLeft] = useState(0.1 * 60);
  const [cycleCount, setCycleCount] = useState(3); // New state for cycle count
  const [time, setTime] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const [font, setFont] = useState("sans");
  const [color, setColor] = useState("salmon");

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

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setTime((prevTime) => ({
      ...prevTime,
      [name]: value,
    }));
  };

  const handleFontChange = (e) => {
    setFont(e.target.value);
    console.log(font);
  };

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  const handleIncrement = (field) => {
    if (time[field] < 99) {
      setTime((prevTime) => ({
        ...prevTime,
        [field]: prevTime[field] + 1,
      }));
    }
  };

  const handleDecrement = (field) => {
    if (time[field] > 1) {
      setTime((prevTime) => ({
        ...prevTime,
        [field]: prevTime[field] - 1 >= 1 ? prevTime[field] - 1 : 1,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
  }, [cycleCount, togglePause]);

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

        {/* Settings Modal */}
        <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen w-full items-center bg-[#0A0C1C]/50 px-6 py-12">
          <div className="flex h-fit w-full flex-col rounded-[15px] bg-white">
            <div className="flex items-center justify-between border-b border-solid border-[#E3E1E1] px-6 pb-7 pt-6">
              <h2 className="before: text-xl font-bold leading-[1.563rem] tracking-normal text-midnight-blue">
                Settings
              </h2>
              <button type="button w-[0.875rem] h-[0.875rem]">
                <img src={iconClose} alt="close icon" />
              </button>
            </div>
            <form
              className="relative flex flex-col items-center p-6"
              onSubmit={handleSubmit}
            >
              <div className="flex w-full flex-col items-center gap-[1.125rem] border-b border-solid border-[#E3E1E1] pb-6">
                <h3 className="text-[0.688rem] font-bold uppercase leading-[0.875rem] tracking-[4.23px] text-midnight-blue">
                  Time (minutes)
                </h3>
                <div className="flex w-full flex-col gap-2">
                  <div className="flex w-full items-center justify-between">
                    <label
                      className="text-xs font-bold leading-[0.938rem] tracking-normal text-midnight-blue/40"
                      htmlFor="pomodoro"
                    >
                      pomodoro
                    </label>
                    <div className="relative flex w-1/2 items-center">
                      <input
                        className="w-full rounded-[10px] bg-pale-grey p-4 text-[0.875rem] font-bold leading-[1.063rem] text-midnight-blue focus:outline-none"
                        type="number"
                        name="pomodoro"
                        id="pomodoro"
                        min={1}
                        max={99}
                        value={time.pomodoro}
                        onChange={handleTimeChange}
                        inputMode="numeric"
                      />
                      <div className="absolute right-4 top-4 flex flex-col gap-2">
                        <button onClick={() => handleIncrement("pomodoro")}>
                          <img src={iconArrowUp} alt="arrow up icon" />
                        </button>
                        <button onClick={() => handleDecrement("pomodoro")}>
                          <img src={iconArrowDown} alt="arrow down icon" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between">
                    <label
                      className="text-xs font-bold leading-[0.938rem] tracking-normal text-midnight-blue/40"
                      htmlFor="shortBreak"
                    >
                      short break
                    </label>
                    <div className="relative flex w-1/2 items-center">
                      <input
                        className="w-full rounded-[10px] bg-pale-grey p-4 text-[0.875rem] font-bold leading-[1.063rem] text-midnight-blue focus:outline-none"
                        type="number"
                        name="shortBreak"
                        id="shortBreak"
                        min={1}
                        max={99}
                        value={time.shortBreak}
                        onChange={handleTimeChange}
                        inputMode="numeric"
                      />
                      <div className="absolute right-4 top-4 flex flex-col gap-2">
                        <button onClick={() => handleIncrement("shortBreak")}>
                          <img src={iconArrowUp} alt="arrow up icon" />
                        </button>
                        <button onClick={() => handleDecrement("shortBreak")}>
                          <img src={iconArrowDown} alt="arrow down icon" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between">
                    <label
                      className="text-xs font-bold leading-[0.938rem] tracking-normal text-midnight-blue/40"
                      htmlFor="longBreak"
                    >
                      long break
                    </label>
                    <div className="relative flex w-1/2 items-center">
                      <input
                        className="w-full rounded-[10px] bg-pale-grey p-4 text-[0.875rem] font-bold leading-[1.063rem] text-midnight-blue focus:outline-none"
                        type="number"
                        name="longBreak"
                        id="longBreak"
                        min={1}
                        max={99}
                        value={time.longBreak}
                        onChange={handleTimeChange}
                        inputMode="numeric"
                      />
                      <div className="absolute right-4 top-4 flex flex-col gap-2">
                        <button onClick={() => handleIncrement("longBreak")}>
                          <img src={iconArrowUp} alt="arrow up icon" />
                        </button>
                        <button onClick={() => handleDecrement("longBreak")}>
                          <img src={iconArrowDown} alt="arrow down icon" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col items-center gap-[1.125rem] border-b border-solid border-[#E3E1E1] py-6">
                <h3 className="text-[0.688rem] font-bold uppercase leading-[0.875rem] tracking-[4.23px] text-midnight-blue">
                  Font
                </h3>
                <div className="flex items-center gap-4">
                  <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-pale-grey font-sans text-[0.938rem] leading-5 text-midnight-blue/[0.7297] transition-colors duration-300 has-[:checked]:bg-midnight-navy has-[:checked]:text-white">
                    <input
                      type="radio"
                      value="sans"
                      checked={font === "sans"}
                      onChange={handleFontChange}
                      className="hidden h-0 w-0"
                    />
                    <span>Aa</span>
                  </label>

                  <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-pale-grey font-serif text-[0.938rem] leading-5 text-midnight-blue/[0.7297] transition-colors duration-300 has-[:checked]:bg-midnight-navy has-[:checked]:text-white">
                    <input
                      type="radio"
                      value="serif"
                      checked={font === "serif"}
                      onChange={handleFontChange}
                      className="hidden h-0 w-0"
                    />
                    <span>Aa</span>
                  </label>

                  <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-pale-grey font-mono text-[0.938rem] leading-5 text-midnight-blue/[0.7297] transition-colors duration-300 has-[:checked]:bg-midnight-navy has-[:checked]:text-white">
                    <input
                      type="radio"
                      value="mono"
                      checked={font === "mono"}
                      onChange={handleFontChange}
                      className="hidden h-0 w-0"
                    />
                    <span>Aa</span>
                  </label>
                </div>
              </div>
              <div className="flex w-full flex-col items-center gap-[1.125rem] pb-[2.156rem] pt-4">
                <h3 className="text-[0.688rem] font-bold uppercase leading-[0.875rem] tracking-[4.23px] text-midnight-blue">
                  Color
                </h3>
                <div className="flex items-center gap-4">
                  <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-salmon text-[0.938rem] leading-5 text-midnight-blue/[0.7297] transition-colors duration-300">
                    <input
                      type="radio"
                      value="salmon"
                      checked={color === "salmon"}
                      onChange={handleColorChange}
                      className="peer hidden h-0 w-0"
                    />
                    <img
                      className="opacity-0 transition-opacity duration-300 peer-checked:opacity-100"
                      src={iconCheck}
                      alt="check icon"
                    />
                  </label>

                  <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-turquoise text-[0.938rem] leading-5 text-midnight-blue/[0.7297] transition-colors duration-300">
                    <input
                      type="radio"
                      value="turquoise"
                      checked={color === "turquoise"}
                      onChange={handleColorChange}
                      className="peer hidden h-0 w-0"
                    />
                    <img
                      className="opacity-0 transition-opacity duration-300 peer-checked:opacity-100"
                      src={iconCheck}
                      alt="check icon"
                    />
                  </label>

                  <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-lavender text-[0.938rem] leading-5 text-midnight-blue/[0.7297] transition-colors duration-300">
                    <input
                      type="radio"
                      value="lavender"
                      checked={color === "lavender"}
                      onChange={handleColorChange}
                      className="peer hidden h-0 w-0"
                    />
                    <img
                      className="opacity-0 transition-opacity duration-300 peer-checked:opacity-100"
                      src={iconCheck}
                      alt="check icon"
                    />
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className={`absolute -bottom-[26.5px] flex h-[3.313rem] w-[8.75rem] items-center justify-center rounded-full text-base font-bold leading-5  text-white transition-colors duration-300 ${color === "salmon" ? "bg-salmon" : color === "turquoise" ? "bg-turquoise" : color === "lavender" ? "bg-lavender" : ""}`}
              >
                Apply
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
