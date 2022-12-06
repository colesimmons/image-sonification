import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Script from 'next/script'
import cx from "classnames"
import { Image as ImageJS } from "image-js";
import { PlayIcon, StopIcon, SpeakerWaveIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { Chuck } from "webchuck";
import type { Photo } from "../types";
import { useChuck, useImage } from "../utils/hooks";
import Button from "./Button";
import UserPhoto from "./UserPhoto";
import Slider from "./Slider";
import DirectionDropdown, { Direction } from "./DirectionDropdown";

function setVars(cropped: ImageJS, chuck: Chuck) {
  // RGB
  const min = cropped.getMin();
  chuck.setFloat("minRed", min[0]);
  chuck.setFloat("minGreen", min[1]);
  chuck.setFloat("minBlue", min[2]);

  const max = cropped.getMax();
  chuck.setFloat("maxRed", max[0]);
  chuck.setFloat("maxGreen", max[1]);
  chuck.setFloat("maxBlue", max[2]);

  const median = cropped.getMedian();
  chuck.setFloat("medianRed", median[0]);
  chuck.setFloat("medianGreen", median[1]);
  chuck.setFloat("medianBlue", median[2]);

  const mean = cropped.getMean();
  chuck.setFloat("meanRed", mean[0]);
  chuck.setFloat("meanGreen", mean[1]);
  chuck.setFloat("meanBlue", mean[2]);

  // Greyscale
  const grey = cropped.grey();

  const minGrey = grey.getMin();
  chuck.setFloat("minGrey", minGrey[0]);

  const maxGrey = grey.getMax();
  chuck.setFloat("maxGrey", maxGrey[0]);

  const medianGrey = grey.getMedian();
  chuck.setFloat("medianGrey", medianGrey[0]);

  const meanGrey = grey.getMean();
  chuck.setFloat("meanGrey", meanGrey[0]);

  // HSL
  const hsl = cropped.hsl();

  const minHSL = hsl.getMin();
  chuck.setFloat("minHue", minHSL[0]);
  chuck.setFloat("minSaturation", minHSL[1]);
  chuck.setFloat("minLightness", minHSL[2]);

  const maxHSL = hsl.getMax();
  chuck.setFloat("maxHue", maxHSL[0]);
  chuck.setFloat("maxSaturation", maxHSL[1]);
  chuck.setFloat("maxLightness", maxHSL[2]);

  const medianHSL = hsl.getMedian();
  chuck.setFloat("medianHSL", medianHSL[0]);
  chuck.setFloat("medianSaturation", medianHSL[1]);
  chuck.setFloat("medianLightness", medianHSL[2]);

  const meanHSL = hsl.getMean();
  chuck.setFloat("meanHSL", meanHSL[0]);
  chuck.setFloat("meanSaturation", meanHSL[1]);
  chuck.setFloat("meanLightness", meanHSL[2]);
}

enum ClipPath {
  Left = "inset(0 0 0 -60px)",
  Right = "inset(0 0 0 60px)",
  Top = "inset(-60px 0 0 0)",
  Bottom = "inset(60px 0 0 0)",
}

export default function ImageSonifier({
  chuck,
  photo,
  setPhoto,
}: {
  chuck: Chuck | null,
  photo: Photo,
  setPhoto: (photo: Photo) => void,
}) {
  const img = useImage(photo);

  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1450); // 5000-this = ms per scan
  const [direction, setDirection] = useState(Direction.ltr); // 5000-this = ms per scan
  const barRef = useRef<HTMLDivElement>(null);
  const intervalID = useRef<ReturnType<typeof setTimeout> | null>(null)

  const interval = 10; // ms to create new window

  const editor = useRef(null);
  const handleReady = () => {
    const newEditor = window.ace.edit("liveCodeEditor");
    newEditor.setTheme("ace/theme/chuck");
    newEditor.session.setMode("ace/mode/chuck");
    newEditor.setOptions({
      fontSize: "13px",
      fontFamily: "Monaco",
      cursorStyle: "ace",
      useSoftTabs: true,
      showFoldWidgets: true,
      foldStyle: "markbeginend",
      maxLines: 50,
      minLines: 5,
    });
    newEditor.container.style.lineHeight = 1.25;
    newEditor.renderer.updateFontSize();
    newEditor.session.setUseWrapMode(true);
    newEditor.setReadOnly(false);
    editor.current = newEditor;
  }

  const start = async () => {
    if (!img || !chuck) return;
    if (chuck.context.state === "suspended") {
      // @ts-ignore
      chuck.context.resume();
    }
    const code = editor.current?.getValue();
    chuck.runCode(code);

    const { width, height } = img;
    const windowRatio = (interval / (5000 - speed));
    const windowWidth = windowRatio * width;
    const halfWindowWidth = windowWidth / 2;
    const windowHeight = windowRatio * width;
    const halfWindowHeight = windowHeight / 2;

    let x = 0
    let y = 0
    if (direction === Direction.rtl) x = width - windowWidth
    if (direction === Direction.btt) y = height - windowHeight

    let localDirection = direction;

    if (barRef.current) {
      if (localDirection === Direction.ltr) {
        barRef.current.style.clipPath = ClipPath.Left;
      } else if (localDirection === Direction.rtl) {
        barRef.current.style.clipPath = ClipPath.Right;
      } else if (localDirection === Direction.ttb) {
        barRef.current.style.clipPath = ClipPath.Top;
      } else if (localDirection === Direction.btt) {
        barRef.current.style.clipPath = ClipPath.Bottom;
      }
    }

    const run = () => {
      // HORIZONTAL
      if (
        localDirection === Direction.ltr ||
        localDirection === Direction.rtl
      ) {
        if (barRef.current) {
          const leftPct = ((x + halfWindowWidth) / width) * 100;
          barRef.current.style.top = "0px";
          barRef.current.style.bottom = "0px";
          barRef.current.style.left = `${leftPct}%`;
          barRef.current.style.right = "unset";
          if (barRef.current.style.opacity === "0") {
            barRef.current.style.opacity = "100";
          }
        }

        const cropped = img.crop({ x, width: windowWidth });
        setVars(cropped, chuck)

        // If LTR and at the end of the photo, turn around
        if (localDirection === Direction.ltr && x + (2 * windowWidth) >= width) {
          localDirection = Direction.rtl;
          if (barRef.current) barRef.current.style.clipPath = ClipPath.Right;
        }

        // If RTL and at the start of the photo, turn around
        if (localDirection === Direction.rtl && x - windowWidth < 0) {
          localDirection = Direction.ltr;
          if (barRef.current) barRef.current.style.clipPath = ClipPath.Left;
        }

        // Update
        if (localDirection === Direction.rtl) x -= windowWidth;
        if (localDirection === Direction.ltr) x += windowWidth;
      }

      // VERTICAL
      if (
        localDirection === Direction.btt ||
        localDirection === Direction.ttb
      ) {
        if (barRef.current) {
          const topPct = ((y + halfWindowHeight) / height) * 100;
          barRef.current.style.top = `${topPct}%`;
          barRef.current.style.left = "0px";
          barRef.current.style.right = "0px";
          barRef.current.style.bottom = "unset";
          barRef.current.style.width = "unset";
          if (barRef.current.style.opacity === "0") {
            barRef.current.style.opacity = "100";
          }
        }

        const cropped = img.crop({ y, height: windowHeight });
        setVars(cropped, chuck)

        // If TTB and at the end of the photo, turn around
        if (localDirection === Direction.ttb && y + (2 * windowHeight) >= height) {
          localDirection = Direction.btt;
          if (barRef.current) barRef.current.style.clipPath = ClipPath.Bottom;
        }

        // If BTT and at the start of the photo, turn around
        if (localDirection === Direction.btt && y - windowHeight < 0) {
          localDirection = Direction.ttb;
          if (barRef.current) barRef.current.style.clipPath = ClipPath.Top;
        }

        // Update
        if (localDirection === Direction.ttb) y += windowHeight;
        if (localDirection === Direction.btt) y -= windowHeight;
      }
    }

    setIsRunning(true);
    run();
    intervalID.current = setInterval(run, interval);
  }

  const stop = async () => {
    setIsRunning(false);
    if (intervalID.current) {
      clearInterval(intervalID.current);
    }
    if (chuck) {
      await chuck.removeLastCode();
    }
    if (barRef.current) {
      barRef.current.style.opacity = "0";
      barRef.current.style.clipPath = "inset(0 0 0 -60px)";
    }
  }

  const close = () => {
    setPhoto(null);
    stop();
  }

  return (
    <div className="relative m-auto flex flex-col space-y-4 w-full h-full">
      <h2 className="text-slate-800 flex items-center font-black">
        <SpeakerWaveIcon className="h-5 w-5 stroke-2 mr-2" />
        image sonifier
      </h2>
      <div className="grid grid-cols-[1fr_200px] w-full gap-x-4">
        <div className="relative">
          {photo instanceof ArrayBuffer && img ? (
            <UserPhoto img={img} />
          ) : null}
          {photo !== null && !(photo instanceof ArrayBuffer) ? (
            <Image
              src={photo}
              alt="Photo"
              className="rounded shadow-2xl w-full"
              width={400}
              height={400}
            />
          ) : null}
          <div className="h-full w-full overflow-hidden rounded">
            <button
              type="button"
              className="p-1 shadow absolute z-20 -top-3 -right-3 rounded-full bg-slate-800 text-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={close}
            >
              <span className="sr-only">New Photo</span>
              <XMarkIcon className="h-4 w-4 text-white" aria-hidden="true" />
            </button>
            <div
              ref={barRef}
              className="scanning-bar absolute bg-[rgb(255,255,255,.8)]"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center items-center space-y-8">
          <Slider
            speed={speed}
            setSpeed={setSpeed}
            isDisabled={isRunning}
          />
          <DirectionDropdown
            value={direction}
            setValue={setDirection}
          />
          {isRunning ? (
            <Button onClick={stop}>
              <>
                <StopIcon className="h-3 w-3 stroke-2 mr-2" />
                Stop
              </>
            </Button>
          ) : (
            <Button onClick={start}>
              <>
                <PlayIcon className="h-3 w-3 stroke-2 mr-2" />
                Start
              </>
            </Button>
          )}
        </div>
      </div>
      <div className="bg-white border-2 border-slate-200 rounded-md shadow-lg overflow-auto">
        <div
          id="liveCodeEditor"
          className="ace_editor ace_hidpi ace-chuck"
        >
{
`// min, max, median, and mean RGB values in the sliding window (0-255)
global float minRed, minGreen, minBlue;
global float maxRed, maxGreen, maxBlue;
global float medianRed, medianGreen, medianBlue;
global float meanRed, meanGreen, meanBlue;

// min, max, median, and mean grey values for a greyscale version of the image (0-255)
global float minGrey, maxGrey, medianGrey, meanGrey;

// min, max, median, and mean HSL values (0-255)
global float minHue, minSaturation, minLightness;
global float maxHue, maxSaturation, maxLightness;
global float medianHue, medianSaturation, medianLightness;
global float meanHue, meanSaturation, meanLightness;

// Pseudo 808 kick synthesis
SinOsc osc => ADSR oscEnv => Gain output;
Noise noise => BPF noiseFilter => ADSR noiseEnv => output;
Envelope freqEnv => blackhole;

400 => noiseFilter.freq;
15 => noiseFilter.Q;

oscEnv.set(1::ms, 400::ms, 0.0, 0::ms);
noiseEnv.set(1::ms, 50::ms, 0.0, 0::ms);

output => dac;

// Play kick
100 => float startFreq;
1::ms => dur riseTime;
55 => float endFreq;
100::ms => dur dropTime;

function void kick() {
    oscEnv.keyOn();
    noiseEnv.keyOn();

    Math.random2(350, 450) => noiseFilter.freq;
    Math.random2(10, 15) => noiseFilter.Q;

    startFreq => freqEnv.target;
    riseTime => freqEnv.duration;
    riseTime => now;

    endFreq => freqEnv.target;
    dropTime => freqEnv.duration;
    dropTime => now;
}

SinOsc sin => dac;
130 => int bpm;
60.0 / bpm => float step;

fun void updateFromVars() {
  while (true) {
    Std.mtof(medianSaturation / 3) => float freq;
    sin.freq(freq);
    (step/2)::second => now;
  }
}


fun void playKick() {
    while (true) {
        spork ~kick();
        step::second => now;
    }
}
function void processEnvelopes() {
    while (true) {
        freqEnv.value() => osc.freq;
        1::samp => now;
    }
}

spork ~ processEnvelopes();

spork ~updateFromVars();
spork ~playKick();

1::week => now;
`
}
        </div>
      </div>
      <Script
        src="https://ccrma.stanford.edu/~cc/220a/webchuck220aFinal/js/ace.js"
        onReady={handleReady}
      />
    </div>
  )
}
