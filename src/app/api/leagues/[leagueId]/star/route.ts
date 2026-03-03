import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ leagueId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({}, { status: 401 });

  const { leagueId } = await params;
  const email = session.user.email;

  const existing = await query("SELECT 1 FROM user_starred_leagues WHERE user_email=$1 AND league_id=$2", [email, leagueId]);
  if (existing.length > 0) {
    await query("DELETE FROM user_starred_leagues WHERE user_email=$1 AND league_id=$2", [email, leagueId]);
    return NextResponse.json({ starred: false });
  } else {
    await query("INSERT INTO user_starred_leagues (user_email, league_id) VALUES ($1, $2)", [email, leagueId]);
    return NextResponse.json({ starred: true });
  }
}
