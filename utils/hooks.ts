import { useEffect, useState } from 'react'
import { Image as ImageJS } from "image-js";
import type { Chuck } from "webchuck";
import type { Photo } from "../types";

export function useImage(photo: Photo) {
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

export function useChuck() {
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
