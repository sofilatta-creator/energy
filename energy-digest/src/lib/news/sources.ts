import { SourceDefinition, Topic } from "./types";

const energyTopics: Topic[] = [
  "grid-infrastructure",
  "storage-and-batteries",
  "energy-markets",
  "policy-and-regulation",
  "finance-and-deals",
];

const aiTopics: Topic[] = [
  "ai-infrastructure",
  "ai-hardware",
  "ai-policy",
  "emerging-tech",
];

export const SOURCE_DEFINITIONS: SourceDefinition[] = [
  {
    id: "semianalysis",
    name: "SemiAnalysis",
    url: "https://semianalysis.com/feed/",
    type: "rss",
    category: "ai",
    region: "global",
    weight: 1.3,
    topics: ["ai-infrastructure", "ai-hardware"],
    keywords: ["data center", "ai infrastructure", "compute", "GPU"],
  },
  {
    id: "datacenter-dynamics",
    name: "Data Center Dynamics",
    url: "https://www.datacenterdynamics.com/en/feeds/news.rss",
    type: "rss",
    category: "ai",
    region: "global",
    weight: 1.2,
    topics: ["ai-infrastructure"],
    keywords: ["data center", "colocation", "hyperscale", "power"],
  },
  {
    id: "utility-dive",
    name: "Utility Dive",
    url: "https://www.utilitydive.com/feeds/news/",
    type: "rss",
    category: "energy",
    region: "north-america",
    weight: 1.2,
    topics: ["grid-infrastructure", "energy-markets", "policy-and-regulation"],
    keywords: ["grid", "utility", "transmission", "power"],
  },
  {
    id: "volts",
    name: "Volts",
    url: "https://www.volts.wtf/feed",
    type: "rss",
    category: "energy",
    region: "north-america",
    weight: 1.1,
    topics: ["grid-infrastructure", "policy-and-regulation", "storage-and-batteries"],
    keywords: ["transmission", "decarbonization", "clean energy"],
  },
  {
    id: "reuters-energy",
    name: "Reuters Energy",
    url: "https://feeds.reuters.com/reuters/USenergyNews",
    type: "rss",
    category: "energy",
    region: "global",
    weight: 1.1,
    topics: energyTopics,
    keywords: ["energy", "power", "oil", "gas", "renewables"],
  },
  {
    id: "reuters-tech",
    name: "Reuters Technology",
    url: "https://feeds.reuters.com/reuters/technologyNews",
    type: "rss",
    category: "ai",
    region: "global",
    weight: 1.0,
    topics: aiTopics,
    keywords: ["AI", "data center", "chip", "semiconductor"],
  },
  {
    id: "datacenter-knowledge",
    name: "Data Center Knowledge",
    url: "https://www.datacenterknowledge.com/rss.xml",
    type: "rss",
    category: "ai",
    region: "global",
    weight: 1.2,
    topics: ["ai-infrastructure"],
    keywords: ["data center", "cloud", "infrastructure"],
  },
  {
    id: "energy-storage-news",
    name: "Energy Storage News",
    url: "https://www.energy-storage.news/feed/",
    type: "rss",
    category: "energy",
    region: "global",
    weight: 1.0,
    topics: ["storage-and-batteries"],
    keywords: ["battery", "storage", "BESS"],
  },
];

export function getSourceDefinition(id: string) {
  return SOURCE_DEFINITIONS.find((source) => source.id === id);
}
