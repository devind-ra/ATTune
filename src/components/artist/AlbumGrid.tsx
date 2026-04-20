// AlbumGrid component
// Contains the following:
// - Uses AlbumCard component to display albums in AlbumGrid function
// - AlbumCard component to display album cover, name, and artist

import Image from "next/image";
import Link from "next/link";
import { LastFMAlbum } from "@/lib/lastfm";
import { getArtistName } from "@/lib/utils";

export function AlbumGrid({ albums }: { albums: LastFMAlbum[] }) {
  if (!albums.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-zinc-100 mb-6">
        Discography
      </h2>
      <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {albums.map((item, idx) => (
          <AlbumCard key={idx} item={item} />
        ))}
      </ul>
    </section>
  );
}

function AlbumCard({ item }: { item: LastFMAlbum }) {
  const img =
    item.image?.find((i) => i.size === "extralarge") ??
    item.image?.find((i) => i.size === "large") ??
    item.image?.[0];
  const artist = getArtistName(item.artist);

  return (
    <li className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group block">
      <Link
        href={`/album/${encodeURIComponent(artist)}/${encodeURIComponent(item.name)}`}
        className="flex flex-col h-full"
      >
        <div className="relative aspect-square">
          {img?.["#text"] ? (
            <Image
              src={img["#text"]}
              alt={`${item.name} cover`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
              N/A
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-zinc-100 text-sm leading-tight line-clamp-2 group-hover:text-sky-400 transition-colors">
            {item.name}
          </h3>
        </div>
      </Link>
    </li>
  );
}
