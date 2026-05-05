// AlbumList Component
// Contains the following:
// - Receives list of albums from useSearch hook
// - Displays list of albums with album art and artist name

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LastFMAlbum } from "@/lib/lastfm";
import { getArtistName, shuffle } from "@/lib/utils";

// props passed to album list
interface AlbumListProps {
  albums: LastFMAlbum[];
  enableShuffle?: boolean;
}

// helper function used to handle display of album covers
function AlbumCover({ album }: { album: LastFMAlbum }) {
  const image =
    album.image?.find((img) => img.size === "large") ?? album.image?.[0];
  const href = `/album/${encodeURIComponent(getArtistName(album.artist))}/${encodeURIComponent(album.name)}`;
  const [artistHovered, setArtistHovered] = useState(false);

  // content called to present album coverage image with album name
  // link allows redirection to artist page
  return (
    <li className="bg-zinc-900 border-1 border-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
      <Link href={href} className="flex flex-col flex-1 overflow-hidden">
        <div className="shrink-0 overflow-hidden relative block">
          {image?.["#text"] ? (
            <Image
              loading="eager"
              fetchPriority="high"
              src={image["#text"]}
              alt={`${album.name} cover`}
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
        <span className="text-xs text-zinc-200 line-clamp-1 mt-0.5">
          <Link
            href={`/artist/${encodeURIComponent(getArtistName(album.artist))}`}
            onMouseEnter={() => setArtistHovered(true)}
            onMouseLeave={() => setArtistHovered(false)}
            className="hover:text-sky-400 hover:bg-sky-900/20 p-2 -m-2 rounded transition-colors inline-block"
          >
            {getArtistName(album.artist)}
          </Link>
        </span>
      </div>
    </li>
  );
}

export function AlbumList({ albums, enableShuffle = false }: AlbumListProps) {
  // constants for handling shuffling of albums
  const [shuffledAlbums, setShuffledAlbums] = useState<LastFMAlbum[] | null>(
    null,
  );
  const [prevAlbums, setPrevAlbums] = useState(albums);

  if (albums !== prevAlbums) {
    setPrevAlbums(albums);
    setShuffledAlbums(null);
  }

  // error handling of no albums being found
  if (albums.length === 0) {
    return <p className="text-zinc-200 text-sm">No albums found.</p>;
  }

  // shuffling of albums
  const handleShuffle = () => {
    setShuffledAlbums(shuffle([...albums]).slice(0, 5));
  };

  // displaying 5 albums at a time
  const displayedAlbums = enableShuffle
    ? shuffledAlbums || albums.slice(0, 5)
    : albums;

  // content called to display 5 albums for user
  // includes shuffle functionality to make use of other 15 albums
  return (
    <div>
      {enableShuffle && albums.length > 5 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-sky-200 bg-sky-900/20 hover:bg-sky-900/40 rounded-full transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Shuffle
          </button>
        </div>
      )}
      <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(enableShuffle ? displayedAlbums : albums).map((album, idx) => (
          <AlbumCover key={`${album.name}-${idx}`} album={album} />
        ))}
      </ul>
    </div>
  );
}
