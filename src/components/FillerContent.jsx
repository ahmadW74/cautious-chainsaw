import React from "react";

export default function FillerContent() {
  return (
    <div className="space-y-12 py-10">
      <section className="max-w-3xl mx-auto space-y-4 animate-in fade-in-0">
        <h2 className="text-2xl font-bold">Understanding DNSSEC</h2>
        <p>
          Domain Name System Security Extensions (DNSSEC) add a layer of trust to
          the DNS lookup process. Signatures attached to records let resolvers
          verify that responses haven't been altered in transit.
        </p>
        <p>
          These dummy paragraphs describe how keys are distributed, how zones are
          signed, and how the chain of trust flows from the root to your domain.
        </p>
      </section>

      <section className="max-w-3xl mx-auto space-y-4 animate-in fade-in-0">
        <h3 className="text-xl font-semibold">Learn More</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li className="animate-pulse">
            Trust anchors start at the root and secure every delegation.
          </li>
          <li className="animate-pulse">
            DNSKEY and RRSIG records prove authenticity for each response.
          </li>
          <li className="animate-pulse">
            Validating resolvers rebuild the chain to stop forged data.
          </li>
        </ul>
      </section>
    </div>
  );
}
