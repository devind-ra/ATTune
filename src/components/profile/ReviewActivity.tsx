// ReviewActivity component
// Contains the following:
// - Displays user's review activity
// - Calls to ActivityCalendar for displaying review activity

import { ActivityCalendar } from "react-activity-calendar";
import { MusicReview } from "@/lib/atproto";
import { useMemo } from "react";
import Link from "next/link";

interface ReviewActivityProps {
  allReviews: { uri: string; value: MusicReview }[];
}

// eslint-disable-next-line max-lines-per-function
export function ReviewActivity({ allReviews }: ReviewActivityProps) {
  const data = useMemo(() => {
    const days: Record<string, number> = {};
    const today = new Date();

    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      days[dateStr] = 0;
    }

    allReviews.forEach((review) => {
      const rDate = new Date(
        review.value.listenedAt || review.value.createdAt,
      );
      const year = rDate.getFullYear();
      const month = String(rDate.getMonth() + 1).padStart(2, "0");
      const day = String(rDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      if (days[dateStr] !== undefined) {
        days[dateStr]++;
      }
    });

    return Object.entries(days).map(([date, count]) => {
      let level = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count === 3) level = 3;
      else if (count >= 4) level = 4;
      return { date, count, level };
    });
  }, [allReviews]);

  return (
    <div className="mt-12 mb-8 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 overflow-hidden shadow-sm">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Review Activity
      </h2>
      <div className="flex justify-center overflow-x-auto pb-4 hide-scrollbar">
        <ActivityCalendar
          data={data}
          maxLevel={4}
          theme={{
            light: ["#f4f4f5", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9"],
            dark: ["#18181b", "#0369a1", "#0284c7", "#0ea5e9", "#38bdf8"],
          }}
          labels={{
            legend: {
              less: "Less",
              more: "More",
            },
            months: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            totalCount: "{{count}} reviews in the last year",
          }}
        />
      </div>
      <div className="mt-6 text-center border-t border-zinc-100 dark:border-zinc-800 pt-5">
        <Link
          href="/reviews"
          className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors inline-block"
        >
          View all reviews &rarr;
        </Link>
      </div>
    </div>
  );
}
