// CountryTopArtist component
// Contains the following:
// - Fetches top artists by country via getGeoTopArtists
// - Allows user to select country

import { useState, useEffect } from "react";
import { LastFMArtist, getGeoTopArtists } from "@/lib/lastfm";
import { ArtistList } from "@/components/ArtistList";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Japan",
  "Brazil",
  "Spain",
  "Canada",
  "France",
  "Germany",
  "Australia",
];

function CountryDropdown({
  country,
  setCountry,
}: {
  country: string;
  setCountry: (v: string) => void;
}) {
  return (
    <div className="shrink-0 relative">
      <select
        value={country}
        aria-label="Select country from dropdown"
        onChange={(e) => setCountry(e.target.value)}
        className="appearance-none bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full outline-none py-2.5 pl-4 pr-10 shadow-sm transition-colors cursor-pointer"
      >
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}

function CountryResults({
  isLoading,
  artists,
}: {
  isLoading: boolean;
  artists: LastFMArtist[];
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <p className="text-zinc-500 text-sm text-center py-12">
        No artists found for this region.
      </p>
    );
  }

  return <ArtistList artists={artists} />;
}

export function GeoTopArtists() {
  const [country, setCountry] = useState<string>("United Kingdom");
  const [artists, setArtists] = useState<LastFMArtist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    async function loadArtists() {
      setIsLoading(true);
      try {
        const data = await getGeoTopArtists(country, "10");
        if (active) {
          setArtists(data);
        }
      } catch (error) {
        console.error("Failed to load country artists", error);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadArtists();

    return () => {
      active = false;
    };
  }, [country]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            Global Sounds
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Discover the top artists in different countries around the world.
          </p>
        </div>

        <CountryDropdown country={country} setCountry={setCountry} />
      </div>

      <div className="min-h-[200px]">
        <CountryResults isLoading={isLoading} artists={artists} />
      </div>
    </div>
  );
}
