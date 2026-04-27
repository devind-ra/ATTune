// DiscoveryAlbums Component
// Contains the following:
// - Displays albums based on tags
// - Allows user to navigate to each album page

import Link from "next/link";
import { DiscoveryTagData } from "@/app/hooks/useExploreData";
import { AlbumList } from "@/components/AlbumList";

interface DiscoveryCarouselProps {
  data: DiscoveryTagData[];
}

export function DiscoverAlbums({ data }: DiscoveryCarouselProps) {
  if (!data?.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-10">
      {data.map(({ tag, albums }) => (
        <div key={tag.name} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-sm font-medium text-sky-400 capitalize">
                Discover
              </h2>
              <h3 className="text-2xl font-bold text-zinc-100 capitalize">
                {tag.name}
              </h3>
            </div>
            {tag.url && (
              <Link
                href={tag.url}
                target="_blank"
                aria-label={`More ${tag.name} on Last.fm`}
                rel="noreferrer noopener"
                className="text-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
              >
                More on Last.fm <span aria-hidden="true">&rarr;</span>
              </Link>
            )}
          </div>
          <div className="bg-black/50 rounded-2xl p-4 border border-zinc-800/50">
            <AlbumList albums={albums} enableShuffle />
          </div>
        </div>
      ))}
    </div>
  );
}
