import { useEffect, useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import Image, { StaticImageData } from 'next/image'
import { Image as ImageJS } from "image-js";
import cx from "classnames"
import { XMarkIcon } from '@heroicons/react/24/outline'
import type { Chuck } from "webchuck";
import type { Photo } from "../types";
import greece from '../public/london.jpg'
import Button from "./Button";

function useImage(photo: Photo) {
  const [img, setImg] = useState<ImageJS | null>(null);
  const hasLoadedImg = img !== null;
  useEffect(() => {
    if (!photo) return
    const x = async () => {
      let src;
      if (photo instanceof ArrayBuffer) {
        src = photo;
      } else if (photo.src) {
        src = photo.src;
      }
      if (src) {
        const img = await ImageJS.load(src);
        setImg(img);
      }
    }
    if (!hasLoadedImg) {
      x();
    }
  }, [hasLoadedImg, photo]);
  return img;
}

function useChuck() {
  const [chuck, setChuck] = useState<Chuck | null>(null);
  const hasChuck = chuck !== null;
  useEffect(() => {
    const loadChuck = async () => {
      const Chuck = (await import('webchuck')).Chuck;
      const chuck = await Chuck.init([]);
      setChuck(chuck);
    }
    loadChuck();
  }, []);
  return chuck;
}

function UserPhoto({ img }: { img: ImageJS | null }) {
  const [base64, setBase64] = useState<string | null>(null);
  useEffect(() => {
    const getBase64 = async () => {
      if (!img) return null;
      const base64 = await img.toBase64();
      setBase64(base64);
    };
    if (!base64) getBase64();
  }, [base64, img]);

  if (base64 === null) return null;

  return (
    <Image
      alt="user-uploaded photo"
      src={`data:image/jpeg;base64,${base64}`}
      width={400}
      height={400}
    />
  );
}

export default function ImageSonifier({
  photo,
  setPhoto,
}: {
  photo: Photo,
  setPhoto: (photo: Photo) => void,
}) {
  const img = useImage(photo);

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

  return (
    <>
      <div className="relative w-80 m-auto rounded">
        {photo instanceof ArrayBuffer && img ? (
          <UserPhoto img={img} />
        ) : null}
        {photo !== null && !(photo instanceof ArrayBuffer) ? (
          <Image
            src={photo}
            alt="Greece"
            className="rounded shadow-2xl"
            width={400}
            height={400}
          />
        ) : null}
        <div className="h-full w-full overflow-hidden rounded">
          <button
            type="button"
            className="p-1 shadow-lg absolute -top-3 -right-3 rounded-full bg-white text-slate-400 text-slate-800 focus:outline-none ring-2 ring-slate-500 focus:ring-indigo-500 focus:ring-offset-2"
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
      <Button onClick={analyze}>
        describe
      </Button>
    </>
  )
}
