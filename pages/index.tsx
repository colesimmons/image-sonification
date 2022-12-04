import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
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

  return (
    <div>
      <Head>
        <title>Image Sonifier</title>
        <meta name="description" content="music has never looked so good" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <button onClick={play}>Play</button>
      <p>Hello World</p>
    </div>
  )
}
