import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;

  const cleanHandle = decodeURIComponent(handle);

  return { title: `${cleanHandle}'s Profile - ATtune` };
}

export default function OtherUserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
