import "dotenv/config";

import { runPipeline } from "@/lib/news/pipeline";

async function main() {
  const result = await runPipeline({ composeDigest: false });
  console.log(`Fetched ${result.articlesFetched} articles, stored ${result.articlesStored}, created ${result.summariesCreated} summaries.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
