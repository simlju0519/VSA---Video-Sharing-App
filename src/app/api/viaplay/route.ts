import { NextRequest, NextResponse } from "next/server";

const BASE = "https://content.viaplay.se/pc-se";

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path) return NextResponse.json({ events: [] }, { status: 400 });

  const section = path.split("/")[0]; // e.g. "sport"

  const res = await fetch(`${BASE}/${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });

  const json = await res.json();
  const blocks = json._embedded?.["viaplay:blocks"] || [];

  const seen = new Set<string>();
  const events = blocks
    .filter((b: { type: string }) => b.type === "list")
    .flatMap((b: { _embedded?: { "viaplay:products"?: Product[] } }) =>
      (b._embedded?.["viaplay:products"] || []).map((p) => mapProduct(p, section))
    )
    .filter((e: { id: string }) => !seen.has(e.id) && seen.add(e.id));

  return NextResponse.json({ events });
}

type Product = {
  publicPath: string;
  content: {
    title: string;
    images: { landscape?: { url: string }; logo?: { template: string } };
    synopsis?: string;
  };
  epg: { start: string; end: string };
  recording?: { airingType: string };
};

function mapProduct(p: Product, section: string) {
  return {
    id: p.publicPath,
    title: p.content.title,
    imageUrl: p.content.images?.landscape?.url || null,
    startTime: p.epg.start,
    endTime: p.epg.end,
    isLiveBroadcast: p.recording?.airingType === "live",
    streamUrl: `https://viaplay.se/${section}/${p.publicPath}`,
  };
}
