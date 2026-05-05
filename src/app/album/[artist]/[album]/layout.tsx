// Album Page Title 

import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ album: string; artist: string }>;
}): Promise<Metadata> {
  const { album, artist } = await params;

  const cleanAlbum = decodeURIComponent(album);
  const cleanArtist = decodeURIComponent(artist);

  return { title: `${cleanAlbum} by ${cleanArtist}` };
}

export default function AlbumPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
