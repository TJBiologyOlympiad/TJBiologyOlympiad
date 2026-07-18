import type { Metadata } from "next";
import { ArrowRight, ArrowDown } from "lucide-react";

export const metadata: Metadata = {
  title: "USABO — TJ Biology Olympiad",
  description:
    "The path through the USA Biology Olympiad — Open Exam, Semifinals, National Finalists, and the International Biology Olympiad — plus the season schedule.",
};

const stages = ["Open Exam", "Semifinals", "National Finalist", "IBO"];

const schedule = [
  { date: "August 7, 2026", event: "USABO registration opens" },
  { date: "November 15, 2026", event: "Registration closes" },
  { date: "February 3, 2027", event: "Online Open Exam" },
  { date: "February 15, 2027", event: "Open Exam scores released" },
  { date: "March 2, 2027", event: "Semifinal Exam" },
  { date: "March 23, 2027", event: "Semifinal scores released" },
  { date: "March 30, 2027", event: "National Finalists announced" },
];

export default function USABOPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
          USA Biology Olympiad
        </h1>
        <p className="mt-4 max-w-2xl text-neutral-600 leading-relaxed">
          The USABO is the pathway that feeds into the International Biology Olympiad (IBO).
          The main focus of the club is preparing students for the exams.
          Here&apos;s how the competition pathway works, and the important dates for the season.
        </p>

        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight inline-block border-b-2 border-sage pb-1 text-neutral-900">
            Path
          </h2>
          <div className="mt-8 flex flex-col md:flex-row md:items-stretch md:justify-center gap-3 md:gap-0">
            {stages.map((stage, i) => (
              <div key={stage} className="flex flex-col md:flex-row md:items-center">
                <div className="flex items-center justify-center text-center border-2 border-neutral-900 rounded-lg px-5 py-4 text-neutral-900 font-medium bg-white md:min-h-[64px] md:w-40">
                  {stage}
                </div>
                {i < stages.length - 1 && (
                  <>
                    <ArrowRight
                      className="hidden md:block w-7 h-7 text-neutral-900 mx-2 shrink-0"
                      strokeWidth={2}
                    />
                    <ArrowDown
                      className="md:hidden w-6 h-6 text-neutral-900 mx-auto my-1 shrink-0"
                      strokeWidth={2}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-semibold tracking-tight inline-block border-b-2 border-sage pb-1 text-neutral-900">
            Schedule
          </h2>
          <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
            {schedule.map((item) => (
              <li
                key={item.date + item.event}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-4"
              >
                <span className="w-44 shrink-0 font-semibold text-neutral-900">
                  {item.date}
                </span>
                <span className="text-neutral-700">{item.event}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-16">
          <h2 className="text-xl font-semibold tracking-tight inline-block border-b-2 border-sage pb-1 text-neutral-900">
            Register
          </h2>
          <p className="mt-4 max-w-2xl text-neutral-600 leading-relaxed">
            Information to register will be at the official <a href="https://usabo-trc.org/" className="text-neutral-900 hover:text-sage">USABO website</a>.
            Do not miss registration! There is no late registration, so set a reminder or register as soon as it opens.
          </p>


        </section>
      </div>
    </div>
  );
}
