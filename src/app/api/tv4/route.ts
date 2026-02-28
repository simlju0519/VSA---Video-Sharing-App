import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_URL = "https://nordic-gateway.tv4.a2d.tv/graphql";
const PERSISTED_HASH = "4c662de1743cc944568f6d604821027d25cc466dfc022d8c0bbe86827128a1bc";

export async function GET(req: NextRequest) {
  const pageId = req.nextUrl.searchParams.get("page") || "shl";

  const variables = {
    includeProgress: false,
    pageId,
    input: { limit: 20, offset: 0 },
    offset: 0,
    limit: 20,
  };

  const params = new URLSearchParams({
    operationName: "Page",
    variables: JSON.stringify(variables),
    extensions: JSON.stringify({ persistedQuery: { version: 1, sha256Hash: PERSISTED_HASH } }),
  });

  const res = await fetch(`${GRAPHQL_URL}?${params}`, {
    headers: { "Client-Name": "tv4-web", "Client-Version": "6.0.0" },
    next: { revalidate: 60 },
  });

  const json = await res.json();
  if (json.errors) return NextResponse.json({ panels: [] });

  const panels = json.data?.page?.content?.panels || [];

  type SportEvent = {
    title: string;
    slug: string;
    id: string;
    league: string;
    arena: string;
    studio: boolean;
    images: { main16x9?: { sourceEncoded: string }; homeTeamLogo?: { sourceEncoded: string }; awayTeamLogo?: { sourceEncoded: string } };
    playableFrom: { readableDateTime: string; isoString: string };
    liveEventEnd: { isoString: string };
  };

  type Card = { content: SportEvent };

  const sportPanels = panels
    .filter((p: { __typename: string }) => p.__typename === "SportEventPanel")
    .map((p: { id: string; title: string; content: { cards: Card[] } }) => ({
      id: p.id,
      title: p.title,
      events: (p.content?.cards || []).map((c: Card) => {
        const e = c.content;
        return {
          id: e.id,
          title: e.title,
          slug: e.slug,
          league: e.league,
          arena: e.arena,
          studio: e.studio,
          imageUrl: e.images?.main16x9?.sourceEncoded ? decodeURIComponent(e.images.main16x9.sourceEncoded) : null,
          homeTeamLogo: e.images?.homeTeamLogo?.sourceEncoded ? decodeURIComponent(e.images.homeTeamLogo.sourceEncoded) : null,
          awayTeamLogo: e.images?.awayTeamLogo?.sourceEncoded ? decodeURIComponent(e.images.awayTeamLogo.sourceEncoded) : null,
          startTime: e.playableFrom?.isoString,
          readableTime: e.playableFrom?.readableDateTime,
          endTime: e.liveEventEnd?.isoString,
        };
      }),
    }));

  return NextResponse.json({ panels: sportPanels });
}
