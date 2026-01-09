import { addHours } from "date-fns";

import { DigestRecord } from "./types";

const now = new Date();

export const SAMPLE_DIGEST: DigestRecord = {
  id: "sample",
  digestDate: now,
  headline: "Sample: Interconnection reform and AI data centers battle for clean power",
  summary:
    "Synthetic digest generated for local development so you can view the UI before wiring live ingestion.",
  items: [
    {
      id: "sample-1",
      topic: "grid-infrastructure",
      category: "energy",
      sentiment: "positive",
      tags: ["ferc", "transmission"],
      bullets: [
        "FERC cleared a 3-year fast-track for high-voltage lines in congested hubs",
        "Regional planners must publish queue transparency metrics quarterly",
        "Interconnection deposits now scale with project readiness milestones",
      ],
      title: "FERC approves interconnection reform to unlock 400 GW stuck in queues",
      source: "BloombergNEF",
      link: "https://example.com/sample-ferc",
      summary:
        "FERC finalized timelines and penalties for transmission owners that miss new deadlines, targeting 400 GW of renewables awaiting hookups.",
      publishedAt: addHours(now, -6),
      importanceScore: 0.91,
    },
    {
      id: "sample-2",
      topic: "ai-infrastructure",
      category: "ai",
      sentiment: "neutral",
      tags: ["hyperscale", "grid"],
      bullets: [
        "NVIDIA-backed Colovore signed a 900 MW clean-power PPA for AI clusters",
        "Deal includes 1.5 GWh of co-located batteries for peak shaving",
        "Utah regulators fast-tracked transmission upgrades to serve the site",
      ],
      title: "AI campus signs 900 MW clean-power contract with storage adders",
      source: "Reuters",
      link: "https://example.com/sample-ai",
      summary:
        "The mega-campus will pair flexible loads with fast-ramping batteries to avoid stressing the Western grid, offering a blueprint for AI data center siting.",
      publishedAt: addHours(now, -4),
      importanceScore: 0.88,
    },
  ],
};
