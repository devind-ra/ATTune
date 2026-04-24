import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Explore` };
}

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
