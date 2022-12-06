import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Image as ImageJS } from "image-js";

export default function UserPhoto({ img }: { img: ImageJS | null }) {
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
      className="w-80"
      alt="user-uploaded photo"
      src={`data:image/jpeg;base64,${base64}`}
      width={400}
      height={400}
    />
  );
}
