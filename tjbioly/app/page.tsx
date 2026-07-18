import Link from "next/link";
import HeroDoodles from "./components/HeroDoodles";

export default function Home() {
  return (
    <div className="bg-[#f6f6f3] text-neutral-800">
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#f6f6f3]">
        <HeroDoodles />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl sm:text-7xl font-semibold tracking-tight mb-4 text-neutral-900">
            TJ Biology Olympiad
          </h1>
          <p className="text-2xl text-neutral-600">One of the most successful Biology Olympiad clubs in the nation.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20 space-y-24">
        <section id="about" className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight inline-block border-b-2 border-sage pb-1">About</h2>
            <p className="mt-5 leading-relaxed">
              TJBO&apos;s primary goal is to provide a conductive learning
              environment dedicated to advancing the knowledge of biology at TJ.
              Our officers work hard to take biology beyond what is typically
              taught in high school classes.
            </p>
            <p className="mt-4 leading-relaxed">
              The majority of our club focuses on preparing for the USA Biology
              Olympiad competition held in February each year, but we also host a
              few smaller competitions, such as our annual winter and spring
              contests. We welcome all interested members to join us in exploring
              the world of biology every Friday 8B.
            </p>
          </div>
          <img
            src="/images/club-24-25.jpg"
            alt="TJ Biology Olympiad members, 2024-2025"
            className="w-full aspect-[4/3]   rounded"
          />
        </section>

        <section id="initiatives" className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <img
            src="/images/techstrav.jpg"
            alt="TJBO running a biology activity at TechStravaganza"
            className="w-full aspect-[4/3]   rounded"
          />
          <div>
            <h2 className="text-xl font-semibold tracking-tight inline-block border-b-2 border-sage pb-1">Initiatives</h2>
            <p className="mt-5 leading-relaxed">
              Beyond our weekly meetings, TJBO brings biology to the
              community at various places such as TechStravaganza, a STEM
              outreach event. We try to foster interest in biology, even
              outside of TJ.
            </p>
            
          </div>
        </section>



        <section id="join">
          <h2 className="text-xl font-semibold tracking-tight inline-block border-b-2 border-sage pb-1">Join Us</h2>
          <p className="mt-5 leading-relaxed">
            We meet every Friday 8B. All interested members are welcome.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm">
            
            <a
              href="https://www.instagram.com/tjbiologyolympiad/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-800 hover:text-sage transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com/groups/118498551586776/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-800 hover:text-sage transition-colors"
            >
              Facebook
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
