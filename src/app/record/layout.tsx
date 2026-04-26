import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Record` };
}

export default function RecordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
