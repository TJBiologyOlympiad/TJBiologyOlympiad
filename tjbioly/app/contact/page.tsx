import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — TJ Biology Olympiad",
  description:
    "Get in touch with TJ Biology Olympiad — email us or message us on Instagram or Facebook.",
};

const EMAIL = "tjhsst.biologyolympiad@gmail.com";
const INSTAGRAM = "https://www.instagram.com/tjbiologyolympiad/";
const FACEBOOK = "https://www.facebook.com/groups/118498551586776/";

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
          Contact
        </h1>
        <p className="mt-4 text-neutral-600 leading-relaxed">
          Have a question or want to get involved? You can email us at{" "}
          <a href={`mailto:${EMAIL}`} className="text-neutral-800 hover:text-sage transition-colors">
            {EMAIL}
          </a>
          , or message us on{" "}
          <a
            href={FACEBOOK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-800 hover:text-sage transition-colors"
          >
            Facebook
          </a>{" "}
          or{" "}
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-800 hover:text-sage transition-colors"
          >
            Instagram
          </a>
          .
        </p>
      </div>
    </div>
  );
}
