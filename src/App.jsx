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
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cycleCount, setCycleCount] = useState(0); // New state for cycle count
  const [time, setTime] = useState(() => {
    if ("time" in localStorage) {
      return JSON.parse(localStorage.getItem("time"));
    } else {
      return {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15,
      };
    }
  });
  const [font, setFont] = useState(() => {
    if ("font" in localStorage) {
      return localStorage.getItem("font");
    } else {
      return "sans";
    }
  });
  const [color, setColor] = useState(() => {
    if ("color" in localStorage) {
      return localStorage.getItem("color");
    } else {
      return "salmon";
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempTime, setTempTime] = useState({
    pomodoro: time.pomodoro,
    shortBreak: time.shortBreak,
    longBreak: time.longBreak,
  });
  const [tempFont, setTempFont] = useState(font);
  const [tempColor, setTempColor] = useState(color);

  const secondsLeftRef = useRef(secondsLeft);
  const isPausedRef = useRef(isPaused);
  const modeRef = useRef(mode);

  // Function to save settings to localStorage
  const saveSettingsToLocalStorage = () => {
    localStorage.setItem("time", JSON.stringify(time));
    localStorage.setItem("font", font);
    localStorage.setItem("color", color);
  };

  const tick = () => {
    secondsLeftRef.current--;
    setSecondsLeft(secondsLeftRef.current);
  };

  const togglePause = () => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
    isPausedRef.current = !isPausedRef.current;

    if (isPaused && cycleCount === 4 && mode === "pomodoro") {
      // Reset back to pomodoro time
      setSecondsLeft(time.pomodoro * 60);
      secondsLeftRef.current = time.pomodoro * 60;

      // Reset cycle count
      setCycleCount(0);
    }
  };

  const toggleModal = () => {
    // Reset temporary states when the modal is closed without applying changes
    if (!isModalOpen) {
      setTempTime({
        pomodoro: time.pomodoro,
        shortBreak: time.shortBreak,
        longBreak: time.longBreak,
      });
      setTempFont(font);
      setTempColor(color);
    }

    setIsModalOpen((prevIsModalOpen) => !prevIsModalOpen);
  };

  const handleClickOutside = (e) => {
    // Check if the click is outside the modal content
    if (e.target.classList.contains("modal-overlay")) {
      toggleModal();
    }
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;

    setTempTime((prevTempTime) => ({
      ...prevTempTime,
      [name]: value,
    }));
  };

  const handleFontChange = (e) => {
    setTempFont(e.target.value);
  };

  const handleColorChange = (e) => {
    setTempColor(e.target.value);
  };

  const handleIncrement = (field) => {
    if (tempTime[field] < 99) {
      setTempTime((prevTempTime) => ({
        ...prevTempTime,
        [field]: prevTempTime[field] + 1,
      }));
    }
  };

  const handleDecrement = (field) => {
    if (tempTime[field] > 1) {
      setTempTime((prevTempTime) => ({
        ...prevTempTime,
        [field]: prevTempTime[field] - 1 >= 1 ? prevTempTime[field] - 1 : 1,
      }));
    }
  };

  const handleSettingsChange = (e) => {
    e.preventDefault();
    toggleModal();

    setFont(tempFont);
    setColor(tempColor);

    // Check if the time settings have changed
    const isTimeChanged =
      tempTime.pomodoro !== time.pomodoro ||
      tempTime.shortBreak !== time.shortBreak ||
      tempTime.longBreak !== time.longBreak;

    // reset the app only when time settings have changed
    if (isTimeChanged) {
      setTime(tempTime);
      setMode("pomodoro");
      setCycleCount(0);
      setSecondsLeft(tempTime.pomodoro * 60);
      secondsLeftRef.current = tempTime.pomodoro * 60;
      setIsPaused(true);
      isPausedRef.current = true;
    }
  };

  useEffect(() => {
    // Save settings to localStorage whenever relevant state changes
    saveSettingsToLocalStorage();
  }, [time, font, color, saveSettingsToLocalStorage]);

  // set default time to pomodoro
  useEffect(() => {
    setSecondsLeft(time.pomodoro * 60);
    secondsLeftRef.current = time.pomodoro * 60;
  }, []);

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
        nextSeconds = time.pomodoro * 60;
      } else if (nextMode === "shortBreak") {
        nextSeconds = time.shortBreak * 60;
      } else {
        nextSeconds = time.longBreak * 60;
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
  }, [cycleCount, togglePause, time]);

  useEffect(() => {
    // Add or remove the 'overflow-y-hidden' class based on the modal state
    if (isModalOpen) {
      document.body.classList.add("overflow-y-hidden");
    } else {
      document.body.classList.remove("overflow-y-hidden");
    }

    // Clean up the effect by removing the class when the component unmounts
    return () => {
      document.body.classList.remove("overflow-y-hidden");
    };
  }, [isModalOpen]);

  useEffect(() => {
    switch (font) {
      case "sans":
        document.body.classList.remove("font-serif", "font-mono");
        document.body.classList.add("font-sans");
        break;
      case "serif":
        document.body.classList.remove("font-sans", "font-mono");
        document.body.classList.add("font-serif");
        break;
      case "mono":
        document.body.classList.remove("font-sans", "font-serif");
        document.body.classList.add("font-mono");
        break;
      default:
        null;
    }
  }, [font]);

  const totalSeconds =
    mode === "pomodoro"
      ? time.pomodoro * 60
      : mode === "shortBreak"
        ? time.shortBreak * 60
        : time.longBreak * 60;
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
        <h1 className="text-center font-sans text-2xl font-bold leading-[1.875rem] tracking-normal text-light-grey">
          pomodoro
        </h1>
      </header>
      <main className="flex w-full flex-col items-center gap-20 px-6">
        <div className="flex w-full max-w-[327px] flex-col items-center gap-12">
          <div className="flex w-full rounded-[32px] bg-midnight-navy p-2">
            <div
              className={`flex-1 rounded-3xl  py-4 text-center text-xs font-bold leading-[0.938rem] tracking-normal transition-colors duration-300  ${mode === "pomodoro" ? `bg-${color} text-midnight-blue` : "bg-transparent text-light-grey/40"}`}
            >
              pomodoro
            </div>
            <div
              className={`flex-1 rounded-3xl  py-4 text-center text-xs font-bold leading-[0.938rem] tracking-normal transition-colors duration-300  ${mode === "shortBreak" ? `bg-${color} text-midnight-blue` : "bg-transparent text-light-grey/40"}`}
            >
              short break
            </div>
            <div
              className={`flex-1 rounded-3xl  py-4 text-center text-xs font-bold leading-[0.938rem] tracking-normal transition-colors duration-300  ${mode === "longBreak" ? `bg-${color} text-midnight-blue` : "bg-transparent text-light-grey/40"}`}
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
                  pathColor: `${color === "salmon" ? "#F87070" : color === "turquoise" ? "#70F3F8" : color === "lavender" ? "#D881F8" : ""}`,
                  trailColor: "#161932",
                  backgroundColor: "#161932",
                })}
              >
                <div className="mt-3 flex flex-col items-center gap-2">
                  <span
                    className={`text-[5rem]  leading-[6.188rem] text-light-grey ${font === "sans" ? "font-bold tracking-[-4px]" : font === "serif" ? "font-bold tracking-normal" : font === "mono" ? "font-normal tracking-[-10px]" : ""}`}
                  >
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
        <button className="h-7 w-7" onClick={toggleModal}>
          <img
            className="h-full w-full object-cover"
            src={iconSettings}
            alt="settings icon"
          />
        </button>

        {/* Settings Modal */}
        <div
          className={`modal-overlay fixed  bottom-0 left-0 right-0 top-0 z-50 flex h-screen w-full items-center  bg-[#0A0C1C]/50 px-6 py-12 opacity-0 transition-opacity duration-300  ${isModalOpen ? "pointer-events-auto opacity-100" : "pointer-events-none"}`}
          onClick={handleClickOutside}
        >
          <div className="mx-auto flex h-fit w-full min-w-[300px] max-w-[327px] flex-col rounded-[15px] bg-white">
            <div className="flex items-center justify-between border-b border-solid border-[#E3E1E1] px-6 pb-7 pt-6">
              <h2 className="before: text-xl font-bold leading-[1.563rem] tracking-normal text-midnight-blue">
                Settings
              </h2>
              <button
                type="button"
                onClick={toggleModal}
                className="h-[0.875rem] w-[0.875rem]"
              >
                <img src={iconClose} alt="close icon" />
              </button>
            </div>
            <form
              className="relative flex flex-col items-center p-6"
              onSubmit={handleSettingsChange}
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
                        max={99}
                        value={tempTime.pomodoro}
                        onChange={handleTimeChange}
                        inputMode="numeric"
                      />
                      <div className="absolute right-4 top-4 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleIncrement("pomodoro")}
                        >
                          <img src={iconArrowUp} alt="arrow up icon" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecrement("pomodoro")}
                        >
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
                        max={99}
                        value={tempTime.shortBreak}
                        onChange={handleTimeChange}
                        inputMode="numeric"
                      />
                      <div className="absolute right-4 top-4 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleIncrement("shortBreak")}
                        >
                          <img src={iconArrowUp} alt="arrow up icon" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecrement("shortBreak")}
                        >
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
                        max={99}
                        value={tempTime.longBreak}
                        onChange={handleTimeChange}
                        inputMode="numeric"
                      />
                      <div className="absolute right-4 top-4 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleIncrement("longBreak")}
                        >
                          <img src={iconArrowUp} alt="arrow up icon" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecrement("longBreak")}
                        >
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
                      checked={tempFont === "sans"}
                      onChange={handleFontChange}
                      className="hidden h-0 w-0"
                    />
                    <span>Aa</span>
                  </label>

                  <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-pale-grey font-serif text-[0.938rem] leading-5 text-midnight-blue/[0.7297] transition-colors duration-300 has-[:checked]:bg-midnight-navy has-[:checked]:text-white">
                    <input
                      type="radio"
                      value="serif"
                      checked={tempFont === "serif"}
                      onChange={handleFontChange}
                      className="hidden h-0 w-0"
                    />
                    <span>Aa</span>
                  </label>

                  <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-pale-grey font-mono text-[0.938rem] leading-5 text-midnight-blue/[0.7297] transition-colors duration-300 has-[:checked]:bg-midnight-navy has-[:checked]:text-white">
                    <input
                      type="radio"
                      value="mono"
                      checked={tempFont === "mono"}
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
                      checked={tempColor === "salmon"}
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
                      checked={tempColor === "turquoise"}
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
                      checked={tempColor === "lavender"}
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
