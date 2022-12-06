import { ChangeEvent } from 'react'
import cx from "classnames"

export default function Slider({
  isDisabled,
  speed,
  setSpeed,
}: {
  isDisabled: boolean,
  speed: number,
  setSpeed: (s: number) => void,
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSpeed(val);
  }

  return (
    <div className={cx(
      "flex flex-col items-center",
      { "opacity-50": isDisabled },
    )}>
      <label
        htmlFor="speed-slider"
        className="text-slate-800 font-bold text-sm mb-2"
      >
        Speed
      </label>
      <input
        id="speed-slider"
        disabled={isDisabled}
        className={cx(
          "appearance-none h-2 rounded bg-slate-300",
          "[&::-webkit-slider-thumb]:bg-indigo-500",
          "[&::-moz-range-thumb]:bg-indigo-500",
          "[&::-webkit-slider-thumb]:border-none",
          "[&::-moz-range-thumb]:border-none",
          "focus:outline-none focus:ring-0 focus:shadow-none",
        )}
        type="range"
        min="0"
        max="2900"
        value={speed}
        onChange={handleChange}
      />
    </div>
  );
}
