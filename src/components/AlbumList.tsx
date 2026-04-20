// AlbumList Component
// Contains the following:
// - Receives list of albums from useSearch hook
// - Displays list of albums with album art and artist name

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LastFMAlbum } from "@/lib/lastfm";
import { getArtistName } from "@/lib/utils";

interface AlbumListProps {
  albums: LastFMAlbum[];
}

function AlbumCover({ album }: { album: LastFMAlbum }) {
  const image =
    album.image?.find((img) => img.size === "large") ?? album.image?.[0];
  const href = `/album/${encodeURIComponent(getArtistName(album.artist))}/${encodeURIComponent(album.name)}`;
  const [artistHovered, setArtistHovered] = useState(false);

  return (
    <li className="bg-zinc-900 border-1 border-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
      <Link href={href} className="flex flex-col flex-1 overflow-hidden">
        <div className="shrink-0 overflow-hidden relative block">
          {image?.["#text"] ? (
            <Image
              src={image["#text"]}
              alt=""
              width={300}
              height={300}
              className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="w-full aspect-square bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
              N/A
            </div>
          )}
        </div>
        <div className="p-3 pb-1">
          <span
            className={`font-medium text-zinc-100 text-sm leading-tight line-clamp-2 transition-colors ${
              artistHovered ? "" : "group-hover:text-sky-400"
            }`}
          >
            {album.name}
          </span>
        </div>
      </Link>

      <div className="px-3 pb-3">
        <span className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
          <Link
            href={`/artist/${encodeURIComponent(getArtistName(album.artist))}`}
            onMouseEnter={() => setArtistHovered(true)}
            onMouseLeave={() => setArtistHovered(false)}
            className="hover:text-sky-400 hover:bg-sky-900/20 px-1 -mx-1 rounded transition-colors inline-block"
          >
            {getArtistName(album.artist)}
          </Link>
        </span>
      </div>
    </li>
  );
}

export function AlbumList({ albums }: AlbumListProps) {
  if (albums.length === 0) {
    return <p className="text-zinc-500 text-sm">No albums found.</p>;
  }

  return (
    <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {albums.map((album, idx) => (
        <AlbumCover key={idx} album={album} />
      ))}
    </ul>
  );
}
