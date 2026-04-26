// AlbumHeader component
// Contains the following:
// - Displays album cover, name, artist and release date

import Image from "next/image";
import Link from "next/link";
import { LastFMImage } from "@/lib/lastfm";

interface Props {
  name: string;
  artist: string;
  img: LastFMImage | undefined;
  releaseDate: string;
}

export function AlbumHeader({ name, artist, img, releaseDate }: Props) {
  return (
    <>
      <div className="relative w-48 md:w-64 aspect-square rounded-2xl overflow-hidden shadow-md mb-8">
        {img?.["#text"] ? (
          <Image
            src={img["#text"]}
            alt={`${name} cover`}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-400">
            N/A
          </div>
        )}
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-2">
        {name}
      </h1>

      <Link href={`/artist/${encodeURIComponent(artist)}`} className="group">
        <p className="text-xl text-zinc-100 group-hover:text-sky-400 mb-4 font-medium transition-colors">
          {artist}
        </p>
      </Link>

      <div className="text-sm text-zinc-100 mb-6">Released: {releaseDate}</div>
    </>
  );
}
