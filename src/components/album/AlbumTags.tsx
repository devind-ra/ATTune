// AlbumTags component
// Contains the following:
// - Displays album tags as part of Album Page

import { LastFMTag } from "@/lib/lastfm";

export function AlbumTags({ tags }: { tags: LastFMTag[] }) {
  // content for album tags as part of Album page
  // maps the first 8 tags for display
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      {tags.slice(0, 8).map((tag, idx) => (
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
