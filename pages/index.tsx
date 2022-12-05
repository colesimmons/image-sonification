import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Button from "../components/Button";
import { Image as ImageJS } from "image-js";
import cx from "classnames"
import greece from '../public/london.jpg'
import type { Chuck } from "webchuck";

// TODO: Direction
// TODO: have scanning bar be based on actual position

// TODO: Sin osc, frequency is based on max blue value
enum Direction {
  ltr = "left-to-right",
  rtl = "right-to-left",
  ttb = "top-to-bottom",
  btt = "bottom-to-top",
}

function useImage() {
  const [img, setImg] = useState<ImageJS | null>(null);
  const hasLoadedImg = img !== null;
  useEffect(() => {
    const x = async () => {
      const img = await ImageJS.load("../greece.jpg");
      setImg(img);
    }
    if (!hasLoadedImg) {
      x();
    }
  }, [hasLoadedImg]);
  return img;
}

function useChuck() {
  const [chuck, setChuck] = useState<Chuck | null>(null);
  const hasChuck = chuck !== null;
  useEffect(() => {
    const loadChuck = async () => {
      console.log(1);
      const Chuck = (await import('webchuck')).Chuck;
      const chuck = await Chuck.init([]);
      setChuck(chuck);
    }
    loadChuck();
  }, []);
  return chuck;
}

// TODO: vertical scan
// TODO: speed slider
// TODO: "upload photo or choose one of these"
// TODO: ChucK editor
// TODO: deployment
// TODO: publish NPM package
// TODO: presentation
// TODO: favicon
// TODO: react package
export default function Home() {
  // const chuck = useChuck();
  const img = useImage();

  const speed = 2000; // ms to run scan
  const interval = 10; // ms to create new window

  const [scanPx, setScanPx] = useState<number | null>(45);
  const barRef = useRef<HTMLDivElement>(null);

  const analyze = async () => {
    const Chuck = (await import('webchuck')).Chuck;
    const chuck = await Chuck.init([]);
    if (!img) return;
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

      5000::ms => now;
      `
    );

    const { width, height } = img;
    const cropWidth = (interval / speed) * width;
    console.log(width);

    let intervalID: ReturnType<typeof setInterval>
    let x = 0
    let reverse = false
    const run = () => {
      if (x + cropWidth >= width) {
        reverse = true
        if (barRef.current) barRef.current.style.clipPath = "inset(0 0 0 60px)"
      }
      if (x - cropWidth <= 0) {
        reverse = false
        if (barRef.current) barRef.current.style.clipPath = "inset(0 0 0 -60px)"
      }

      const left = reverse ? x - cropWidth : x + cropWidth;
      const leftPct = (left / width) * 100;

      if (barRef.current) {
        barRef.current.style.left = `${leftPct}%`;
      }

      // setScanPx(((x + cropWidth) / width) * 100);
      const cropped = img.crop({
        x: reverse ? x - cropWidth : x,
        width: cropWidth
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
      if (reverse) {
        x -= cropWidth;
      } else {
        x += cropWidth;
      }
    }

    intervalID = setInterval(run, interval)
  }

  console.log(scanPx);

  return (
    <div className="h-full w-full bg-slate-50 p-4">
      <Head>
        <title>Image Sonifier</title>
        <meta name="description" content="music has never looked so good" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative w-80 m-auto rounded">
        <Image
          src={greece}
          alt="Greece"
          className="rounded shadow-2xl"
        />
        <div className="h-full w-full overflow-hidden rounded">
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
      <Button onClick={analyze}>
        describe
      </Button>
    </div>
  )
}
