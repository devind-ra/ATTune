import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Profile` };
}

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
