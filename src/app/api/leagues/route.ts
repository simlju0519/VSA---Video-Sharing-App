import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json([], { status: 401 });

  const email = session.user.email;
  const leagues = await query(
    `SELECT l.*, EXISTS(SELECT 1 FROM user_starred_leagues s WHERE s.league_id = l.id AND s.user_email = $1) AS starred
     FROM leagues l ORDER BY l.category, l.sort_order`,
    [email]
  );
  return NextResponse.json(leagues);
}
