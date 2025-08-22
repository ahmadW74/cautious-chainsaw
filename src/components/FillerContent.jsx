import React, { useState } from "react";

const slides = [
  { src: "https://picsum.photos/seed/1/800/300", caption: "Secure your domain" },
  { src: "https://picsum.photos/seed/2/800/300", caption: "Visualize trust chains" },
  { src: "https://picsum.photos/seed/3/800/300", caption: "Explore DNSSEC" },
];

export default function FillerContent() {
  const [index, setIndex] = useState(0);
  const next = () => setIndex((index + 1) % slides.length);
  const prev = () => setIndex((index - 1 + slides.length) % slides.length);
  return (
    <div className="space-y-12 py-10">
      <div className="relative w-full max-w-3xl mx-auto">
        <img
          src={slides[index].src}
          alt=""
          className="w-full h-64 object-cover rounded"
        />
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
          type="button"
        >
          ‹
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
          type="button"
        >
          ›
        </button>
      </div>

      <section className="max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold">Understanding DNSSEC</h2>
        <p>
          Domain Name System Security Extensions (DNSSEC) add a layer of trust to
          the DNS lookup process. This placeholder text gives a brief overview of
          how signatures protect responses.
        </p>
        <p>
          Filler content continues here explaining the benefits of DNSSEC,
          ensuring authenticity and preventing tampering of DNS records.
        </p>
      </section>

      <section className="max-w-3xl mx-auto space-y-4">
        <h3 className="text-xl font-semibold">Learn More</h3>
        <Accordion title="How DNSSEC Works">
          <p>
            DNSSEC uses public key cryptography to sign DNS data. Resolvers
            verify these signatures to ensure data integrity.
          </p>
        </Accordion>
        <Accordion title="Why Use DNSSEC">
          <p>
            It protects users from cache poisoning attacks and provides a chain
            of trust from the root zone downward.
          </p>
        </Accordion>
        <Accordion title="Deployment Challenges">
          <p>
            Enabling DNSSEC can be complex due to key management and coordination
            between registrars and DNS operators.
          </p>
        </Accordion>
      </section>
    </div>
  );
}

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b">
      <button
        className="w-full flex justify-between items-center py-2 text-left font-medium"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span>{title}</span>
        <span>{open ? "-" : "+"}</span>
      </button>
      {open && <div className="pb-4 text-sm">{children}</div>}
    </div>
  );
}
