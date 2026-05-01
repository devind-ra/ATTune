import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-6xl font-bold text-sky-400 drop-shadow-md">
          404 - Page Not Found
        </h1>
        <p className="text-gray-300">
          Apologies, doesn&apos;t seem like this is a page. Maybe it got lost
          along the way?
        </p>
        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/home"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-full font-medium transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
