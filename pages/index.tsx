import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Image, { StaticImageData } from 'next/image'
import ImageSonifier from "../components/ImageSonifier";
import SelectImage from "../components/SelectImage";
import type { Photo } from "../types";
import greece from "../public/greece.jpg"

enum Direction {
  ltr = "left-to-right",
  rtl = "right-to-left",
  ttb = "top-to-bottom",
  btt = "bottom-to-top",
}

// TODO: vertical scan
// TODO: ChucK editor
// TODO: deployment
// TODO: publish NPM package
// TODO: presentation
// TODO: favicon
// TODO: react package
// TODO: start -> stop button
// TODO: submission to factory
export default function Home() {
  const [photo, setPhoto] = useState<Photo>(greece); // TODO

  return (
    <div className="h-full w-full bg-slate-50 p-4">
      <Head>
        <title>Image Sonifier</title>
        <meta name="description" content="music has never looked so good" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {photo ? (
        <ImageSonifier
          photo={photo}
          setPhoto={setPhoto}
        />
      ) : (
        <SelectImage
          setPhoto={setPhoto}
        />
      )}
    </div>
  )
}
