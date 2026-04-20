// Markdown Components
// Contains the following:
// - Custom components for rendering markdown from react-markdown library

export const components = {
  h1: ({ ...props }) => (
    <h1
      className="text-3xl font-bold text-zinc-100 mb-4 pb-6 border-b border-zinc-800"
      {...props}
    />
  ),
  h2: ({ ...props }) => (
    <h2
      className="text-xl font-semibold text-zinc-100 mt-8 mb-3"
      {...props}
    />
  ),
  p: ({ ...props }) => (
    <p className="text-zinc-400 mb-4" {...props} />
  ),
  ul: ({ ...props }) => (
    <ul
      className="list-disc pl-5 mb-4 text-zinc-400"
      {...props}
    />
  ),
  ol: ({ ...props }) => (
    <ol
      className="list-decimal pl-5 mb-4 text-zinc-400"
      {...props}
    />
  ),
  a: ({ ...props }) => (
    <a className="text-sky-400 hover:underline" {...props} />
  ),
};
