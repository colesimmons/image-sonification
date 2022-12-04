import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Button from "../components/Button";
import { Image as ImageJS } from "image-js";
import cx from "classnames"
import greece from '../public/greece.jpg'

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

export default function Home() {
  const img = useImage();
  console.log(img);

  const play = async () => {
    /*
    const Chuck = (await import('webchuck')).Chuck;
    const chuck = await Chuck.init([], "./chuck-processor.js");
    if (!chuck) return
    const x = chuck.runCode(
      `
      SinOsc sin => dac;
      sin.freq(220);
      1000::ms => now;
      `
    );
    console.log(x);
     */
  }

  const speed = 2000; // ms to run scan
  const interval = 10; // ms to create new window

  const [isScanning, setIsScanning] = useState(false);

  const analyze = async () => {
    if (img === null) return;
    setIsScanning(true);
    const { width, height } = img;
    const cropWidth = (interval / speed) * width;
    console.log(width);

    let intervalID: ReturnType<typeof setInterval>
    let x = 0
    const run = () => {
      if (x + cropWidth >= width) {
        clearInterval(intervalID);
        setIsScanning(false);
      } else {
        const cropped = img.crop({ x, width: cropWidth });
        console.log(cropped)
        x += cropWidth;
      }
    }
    intervalID = setInterval(run, interval)
  }

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
            className={cx(
              "scanning-bar absolute top-0 left-0 bottom-0 w-2 bg-[rgb(255,255,255,.8)]",
              {
                "hidden": !isScanning,
                "visible animate-[scan_2s_linear_infinite]": isScanning,
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
