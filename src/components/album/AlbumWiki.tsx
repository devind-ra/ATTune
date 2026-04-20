// AlbumWiki component
// Contains the following:
// - Displays album wiki as part of Album Page and link to last.fm

export function AlbumWiki({ html, url }: { html: string; url?: string }) {
  if (!html) return null;
  return (
    <>
      <div
        className="prose dark:prose-invert prose-zinc prose-sm max-w-none text-zinc-300 leading-relaxed max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 text-center px-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-6 text-sm font-medium text-sky-400 hover:text-sky-300 inline-block w-fit"
        >
          View full album on Last.fm →
        </a>
      )}
    </>
  );
}
