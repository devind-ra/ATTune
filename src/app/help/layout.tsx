import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Help` };
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
