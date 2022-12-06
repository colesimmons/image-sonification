import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import cx from "classnames"
import { XMarkIcon } from '@heroicons/react/24/outline'
import type { Photo } from "../types";
import { useChuck, useImage } from "../utils/hooks";
import Button from "./Button";
import UserPhoto from "./UserPhoto";
import Slider from "./Slider";

export default function ImageSonifier({
  photo,
  setPhoto,
}: {
  photo: Photo,
  setPhoto: (photo: Photo) => void,
}) {
  const chuck = useChuck();
  const img = useImage(photo);

  const [speed, setSpeed] = useState(1450); // 5000-this = ms per scan

  const interval = 10; // ms to create new window

  const [scanPx, setScanPx] = useState<number | null>(45);
  const barRef = useRef<HTMLDivElement>(null);

  const start = async () => {
    if (!img || !chuck) return;
    if (chuck.context.state === "suspended") {
      // @ts-ignore
      chuck.context.resume();
    }
    chuck.runCode(
      `
      global float medianBlue;
      Step unity => Envelope freqEnv => blackhole;

      SinOsc sin => dac;
      sin.freq(200);

      fun void updateFromVars() {
        while (true) {
          Std.mtof(medianBlue / 2) => float freq;
          freqEnv.target(freq);
          sin.freq(freq);
          10::ms => now;
        }
      }

      spork ~updateFromVars();

      1::week => now;
      `
    );

    const { width, height } = img;
    const windowWidth = (interval / (5000 - speed)) * width;
    const halfWindow = windowWidth / 2;

    let x = 0
    let reverse = false

    const run = () => {
      if (barRef.current) {
        const leftPct = ((x + halfWindow) / width) * 100;
        barRef.current.style.left = `${leftPct}%`;
      }

      const cropped = img.crop({
        x,
        width: windowWidth,
      });
      const max = cropped.getMax();
      const min = cropped.getMin();
      const sum = cropped.getSum();
      const grey = cropped.grey();
      const mean = cropped.getMean();
      const median = cropped.getMedian();
      /*(
      console.log({
        cropped,
        max,
        min,
        sum,
        grey,
        mean,
        median
      });
      */
      // console.log(mean[2]);
      chuck.setFloat("medianBlue", median[2]);

      if (!reverse && x + (2 * windowWidth) >= width) {
        reverse = true
        if (barRef.current) barRef.current.style.clipPath = "inset(0 0 0 60px)"
      }
      if (reverse && x - windowWidth < 0) {
        reverse = false
        if (barRef.current) barRef.current.style.clipPath = "inset(0 0 0 -60px)"
      }

      if (reverse) {
        x -= windowWidth;
      } else {
        x += windowWidth;
      }
    }

    run();
    setInterval(run, interval);
  }

  return (
    <div className="relative m-auto flex flex-col items-center space-y-4 w-96">
      <div className="relative">
        {photo instanceof ArrayBuffer && img ? (
          <UserPhoto img={img} />
        ) : null}
        {photo !== null && !(photo instanceof ArrayBuffer) ? (
          <Image
            src={photo}
            alt="Photo"
            className="rounded shadow-2xl w-80"
            width={400}
            height={400}
          />
        ) : null}
        <div className="h-full w-full overflow-hidden rounded">
          <button
            type="button"
            className="p-1 shadow-lg absolute -top-3 -right-3 rounded-full bg-white text-slate-400 text-slate-800 focus:outline-none ring-1 ring-slate-500 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => setPhoto(null)}
          >
            <span className="sr-only">New Photo</span>
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <div
            ref={barRef}
            className={cx(
              "scanning-bar absolute top-0 bottom-0 w-0 bg-[rgb(255,255,255,.8)]",
              {
                // "hidden": !scanPx && false,
                // "visible animate-[left_2s_linear]": scanPx || true,
              }
            )}
          />
        </div>
      </div>
      <Slider
        speed={speed}
        setSpeed={setSpeed}
        isDisabled
      />
      <Button onClick={start}>
        describe
      </Button>
    </div>
  )
}
