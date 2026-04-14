// DiscoveryCarousel Component
// Contains the following:
// - Displays albums based on tags

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
              <span className="text-sm font-medium text-sky-600 dark:text-sky-400 capitalize">
                Discover
              </span>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                {tag.name}
              </h3>
            </div>
            {tag.url && (
              <Link
                href={tag.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
              >
                More on Last.fm <span aria-hidden="true">&rarr;</span>
              </Link>
            )}
          </div>
          <div className="bg-zinc-50 dark:bg-black/20 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/50">
            <AlbumList albums={albums} />
          </div>
        </div>
      ))}
    </div>
  );
}
