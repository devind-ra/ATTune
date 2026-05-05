// Home Page Title

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Home` };
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
