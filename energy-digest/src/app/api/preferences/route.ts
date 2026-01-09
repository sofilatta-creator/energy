import { NextResponse } from "next/server";

import { SOURCE_DEFINITIONS } from "@/lib/news/sources";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(SOURCE_DEFINITIONS);
}
