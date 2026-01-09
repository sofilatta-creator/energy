import "dotenv/config";

import { runPipeline } from "@/lib/news/pipeline";

async function main() {
  const compose = !process.argv.includes("--ingest-only");
  const result = await runPipeline({ composeDigest: compose });
  console.log(
    JSON.stringify(
      {
        ...result,
        completedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
