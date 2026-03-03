import { NextRequest, NextResponse } from "next/server";
import { pinnedApi } from "@/lib/pinnedClient";

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  try {
    const flaskRes = await pinnedApi.delete("/api/deletetimetable", {data: body});
    return NextResponse.json(flaskRes.data, { status: flaskRes.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, {
      status: err.response?.status || 500
    });
  }
}