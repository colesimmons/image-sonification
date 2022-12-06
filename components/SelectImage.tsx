import { ChangeEvent, DragEvent, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import cx from "classnames";
import type { Photo } from "../types";
import { PhotoIcon } from '@heroicons/react/24/outline'
import greece from "../public/greece.jpg"
import greece2 from "../public/greece2.jpg"
import london from "../public/london.jpg"
import porto from "../public/porto.jpg"
import thailand from "../public/thailand.jpg"
import thailand2 from "../public/thailand2.jpg"
import yellowstone from "../public/yellowstone.jpg"

function DragAndDropUpload({
  setPhoto
}: {
  setPhoto: (img: Photo) => void,
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = async (files: FileList) => {
    const photo = files[0];
    if (!photo) return
    const buffer = await photo.arrayBuffer();
    setPhoto(buffer);
  }

  const selectImg = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files === null) return;
    handleFiles(files);
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files === null) return;
    handleFiles(files);
  }

  return (
    <div
      className={cx(
        "flex max-w-lg justify-center rounded-md border-2 border-dashed",
        "px-6 pt-5 pb-6",
        {
          "border-slate-300": !isDragOver,
          "border-indigo-300": isDragOver,
        }
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="space-y-1 text-center">
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex text-sm text-slate-600">
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
          >
            <span>Upload a file</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              onChange={selectImg}
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-slate-500">PNG or JPG up to 10MB (local system only)</p>
      </div>
    </div>
  );
}

export default function SelectImage({
  setPhoto
}: {
  setPhoto: (img: Photo) => void,
}) {
  const imgs = [
    thailand2,
    greece,
    yellowstone,
    thailand,
    greece2,
    london,
  ]

  return (
    <div className="text-slate-900">
      <h1 className="font-bold text-3xl">
        Image Sonifier
      </h1>
      <p>
        Upload a photo, or select one from the samples below.
      </p>
      <div className="mt-4 sm:col-span-2">
        <DragAndDropUpload setPhoto={setPhoto} />
      </div>
      <div className="mt-6 grid grid-cols-[auto_auto_auto] items-stretch gap-6 max-w-3xl">
        {imgs.map((img, i) => (
          <Image
            key={img.src}
            src={img}
            alt="Greece"
            onClick={() => setPhoto(img)}
            className={cx(
              "rounded shadow-xl",
              "transition-shadow transition-transform",
              "hover:scale-110 hover:cursor-pointer hover:shadow-2xl hover:rotate-0",
              {
                "-rotate-1": i === 0 || i === 2 || i === 4,
                "rotate-1": i === 1 || i === 3 || i == 5,
              }
            )}
          />
        ))}
      </div>
    </div>
  );
}
