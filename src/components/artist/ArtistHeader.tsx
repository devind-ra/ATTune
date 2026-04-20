// ArtistHeader component
// Contains the following:
// - Displays artist name, stats, tags, and bio
// - Utilises functions to retrieve artist tags and stats

import { LastFMArtistInfo, LastFMTag } from "@/lib/lastfm";

const BIO_LINK_REGEX =
  /<a href="https:\/\/www\.last\.fm[^>]+>Read more on Last\.fm<\/a>/g;

export function ArtistHeader({ artistInfo }: { artistInfo: LastFMArtistInfo }) {
  const stats = artistInfo.stats || {};
  const tags: LastFMTag[] = artistInfo.tags?.tag || [];
  const bioContent =
    artistInfo.bio?.summary?.replace(BIO_LINK_REGEX, "") ||
    "No biography available.";

  return (
    <div className="mt-8 relative bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-zinc-800">
      <div className="p-8 flex flex-col justify-center">
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-2">
          {artistInfo.name}
        </h1>
        <ArtistStats stats={stats} />
        <ArtistTags tags={tags} />
        <div
          className="prose dark:prose-invert prose-zinc prose-sm max-w-none text-zinc-300 leading-relaxed max-h-48 overflow-y-auto pr-2 custom-scrollbar"
          dangerouslySetInnerHTML={{ __html: bioContent }}
        />
        {artistInfo.url && (
          <a
            href={artistInfo.url}
            aria-label="View full profile on Last.fm"
            target="_blank"
            rel="noreferrer"
            className="mt-4 text-sm font-medium text-sky-400 hover:text-sky-300 inline-block w-fit"
          >
            View full profile on Last.fm →
          </a>
        )}
      </div>
    </div>
  );
}

function ArtistStats({ stats }: { stats: Record<string, string> }) {
  if (!stats.listeners && !stats.playcount) return null;
  return (
    <div className="flex gap-4 text-sm text-zinc-400 mb-6 font-medium">
      {stats.listeners && (
        <span>{parseInt(stats.listeners).toLocaleString()} Listeners</span>
      )}
      {stats.playcount && (
        <span>{parseInt(stats.playcount).toLocaleString()} Scrobbles</span>
      )}
    </div>
  );
}

function ArtistTags({ tags }: { tags: LastFMTag[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tags.slice(0, 5).map((tag, idx) => (
        <span
          key={idx}
          className="px-3 py-1 bg-sky-900/20 text-sky-400 rounded-full text-xs font-medium border border-sky-800"
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
}
