import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Reviews` };
}

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
