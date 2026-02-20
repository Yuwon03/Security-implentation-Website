import { NextRequest, NextResponse } from "next/server";
import { pinnedApi } from "@/lib/pinnedClient";

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  try {
    const flaskRes = await pinnedApi.patch("/api/updatetaskstatus", body);
    return NextResponse.json(flaskRes.data, { status: flaskRes.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, {
      status: err.response?.status || 500
    });
  }
}
