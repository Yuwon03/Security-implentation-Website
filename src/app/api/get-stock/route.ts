import { google } from "googleapis";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET() {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const range = "Sheet1!A2:K"; // Adjust based on your sheet (PatternNo to InstallationURL)

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values || [];
        if (rows.length === 0) {
            return NextResponse.json({ message: "No data found in Google Sheets" }, { status: 404 });
        }

        // Map each row to the respective column
        const stockData = rows.map(row => ({
            PatternNo: row[0] || "N/A",
            Quantity: row[1] || "0",
            Section: row[2] || "N/A",
            Type: row[3] || "N/A",
            Colour: row[4] || "N/A",
            Tag: row[5] || "N/A",
            Price: row[6] || "0",
            Repeat: row[7] || "N/A",
            Company: row[8] || "N/A",
            ImageURL: row[9] || "",
            InstallationURL: row[10] || "",
        }));

        return NextResponse.json(stockData, { status: 200 });
    } catch (error: unknown) { // ✅ Use `unknown` instead of `any`
        let errorMessage = "Unknown error occurred";
    
        if (error instanceof Error) {
            errorMessage = error.message; // ✅ Safely access `message` if it's an Error object
        }
    
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }    
}
