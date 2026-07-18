const EMAIL = "tjhsst.biologyolympiad@gmail.com";
const INSTAGRAM = "https://www.instagram.com/tjbiologyolympiad/";
const FACEBOOK = "https://www.facebook.com/groups/118498551586776/";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-sage">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <p className="text-neutral-900 font-semibold text-xl mb-3">
          TJ Biology Olympiad
        </p>
        <p className="text-neutral-800 text-md">
          Email:{" "}
          <a href={`mailto:${EMAIL}`} className="hover:text-neutral-500 transition-colors">
            {EMAIL}
          </a>
        </p>
        <p className="text-neutral-800 text-md">
          Instagram:{" "}
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-500 transition-colors"
          >
            @tjbiologyolympiad
          </a>
        </p>
        <p className="text-neutral-800 text-md">
          Facebook:{" "}
          <a
            href={FACEBOOK}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-500 transition-colors"
          >
            TJ Biology Olympiad Group
          </a>
        </p>
        <p className="text-neutral-800 text-md mt-4">
          Website created by Eli Feldman
        </p>
      </div>
    </footer>
  );
}
