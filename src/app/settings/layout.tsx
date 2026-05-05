// Settings Page Title

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Settings` };
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
