import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Image, { StaticImageData } from 'next/image'
import ImageSonifier from "../components/ImageSonifier";
import SelectImage from "../components/SelectImage";
import type { Photo } from "../types";
import { useChuck } from "../utils/hooks";
import greece from "../public/greece.jpg"

// TODO: submission to factory
export default function Home() {
  const [photo, setPhoto] = useState<Photo>(null);
  const ace = useRef(null);
  const chuck = useChuck();

  return (
    <div className="h-full w-full bg-slate-50 p-4">
      <Head>
        <title>image sonifier</title>
        <meta name="description" content="music has never looked so good" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-3xl mx-auto h-full">
        {photo ? (
          <ImageSonifier
            chuck={chuck}
            photo={photo}
            setPhoto={setPhoto}
          />
        ) : (
          <SelectImage
            setPhoto={setPhoto}
          />
        )}
      </div>
    </div>
  )
}
