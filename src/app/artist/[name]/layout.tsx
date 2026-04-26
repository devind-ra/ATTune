import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;

  const cleanArtist = decodeURIComponent(name);
  const capitalisedArtist =
    cleanArtist.charAt(0).toUpperCase() + cleanArtist.slice(1);

  return { title: `${capitalisedArtist}` };
}

export default function ArtistPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
