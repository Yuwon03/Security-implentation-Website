import { NextRequest, NextResponse } from "next/server";
import { pinnedApi } from "@/lib/pinnedClient";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username');
  if (!username) {
    return NextResponse.json({ error: "Missing username parameter" }, { status: 400 });
  }
  
  try {
    const flaskRes = await pinnedApi.get(`/api/gettasks?username=${encodeURIComponent(username)}`);
    console.log(flaskRes.data)
    return NextResponse.json(flaskRes.data, { status: flaskRes.status });
  } catch (err: any) {
    console.log("here")
    console.error('Error fetching chats:', err);
    const errorMessage = err.response?.data?.error || err.message || "Failed to fetch chats";
    return NextResponse.json({ error: errorMessage }, {
      status: err.response?.status || 500
    });
  }
}