import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Allowed origins (update with your domain)
const allowedOrigins = ["https://wallpapermastersmanagement.vercel.app/", "http://localhost:3000"];

export function middleware(req: NextRequest) {
    const origin = req.headers.get("origin");

    // 🔹 Block requests from disallowed origins
    if (origin && !allowedOrigins.includes(origin)) {
        return new NextResponse("CORS policy: This origin is not allowed", { status: 403 });
    }

    // Allow CORS for allowed origins
    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", origin || "https://yourdomain.com");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.nextUrl.pathname.startsWith("/")) {
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
    }
    
    return res;
}

// ✅ Apply this middleware **only to API routes**
export const config = {
    matcher: "/api/:path*",
};
