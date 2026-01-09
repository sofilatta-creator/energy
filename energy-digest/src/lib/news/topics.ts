import { Topic } from "./types";

export const TOPIC_LABELS: Record<Topic, string> = {
  "grid-infrastructure": "Grid & Transmission",
  "storage-and-batteries": "Storage & Batteries",
  "energy-markets": "Energy Markets",
  "policy-and-regulation": "Policy & Regulation",
  "finance-and-deals": "Financing & Deals",
  "ai-infrastructure": "AI Infrastructure",
  "ai-hardware": "AI Hardware & Chips",
  "ai-policy": "AI Policy & Standards",
  "emerging-tech": "Emerging Tech",
};

export const ALL_TOPICS = Object.entries(TOPIC_LABELS).map(([key, label]) => ({
  topic: key as Topic,
  label,
}));

export function isEnergyTopic(topic: Topic) {
  return (
    topic === "grid-infrastructure" ||
    topic === "storage-and-batteries" ||
    topic === "energy-markets" ||
    topic === "policy-and-regulation" ||
    topic === "finance-and-deals"
  );
}

export function isAiTopic(topic: Topic) {
  return !isEnergyTopic(topic);
}
