import { google } from "googleapis";
import { getServerSession } from "next-auth";
//import { authOptions } from "../auth/[...nextauth]/route"; // Import auth config
import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";

function cleanInput(input: string) {
    return sanitizeHtml(input, {
        allowedTags: [],
        allowedAttributes: {},
    });
}

export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Read request body ONCE
        const { PatternNo, updates } = await req.json();

        if (!PatternNo || !updates) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }

        // Sanitize all inputs
        for (const key in updates) {
            if (typeof updates[key] === "string") {
                updates[key] = cleanInput(updates[key]);
            }
        }

        // Authenticate with Google Sheets API
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const sheetName = "Sheet1";

        // Fetch current stock data
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A1:M`, // Ensure column headers are fetched
        });

        const rows = response.data.values || [];
        const headers = rows[0]; // Get column headers
        const dataRows = rows.slice(1); // Get actual data rows

        let rowNumber = -1;
        dataRows.forEach((row, index) => {
            if (row[0]?.toString() === PatternNo.toString()) {
                rowNumber = index + 2; // Adjust row index (1-based index)
            }
        });

        if (rowNumber === -1) {
            return NextResponse.json({ error: "Product not found in Google Sheets" }, { status: 404 });
        }

        // Prepare update values
        const updateRequests = Object.entries(updates)
            .map(([field, value]) => {
                const columnIndex = headers.indexOf(field);
                if (columnIndex === -1) return null;
                return {
                    range: `${sheetName}!${String.fromCharCode(65 + columnIndex)}${rowNumber}`,
                    values: [[value]],
                };
            })
            .filter((update) => update !== null);

        // Execute updates safely
        for (const update of updateRequests) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: update!.range,
                valueInputOption: "RAW",
                requestBody: { values: update!.values },
            });
        }

        return NextResponse.json({ message: "Stock updated successfully!" }, { status: 200 });
    } catch (error: unknown) { // ✅ Use `unknown` instead of `any`
        let errorMessage = "Unknown error occurred";
    
        if (error instanceof Error) {
            errorMessage = error.message; // ✅ Safely access `message` if it's an Error object
        }
    
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    
}