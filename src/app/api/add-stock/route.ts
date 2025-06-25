import { google } from "googleapis";
import { getServerSession } from "next-auth";
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
        const body = await req.json();
        const newStock = body.newStock;

        if (!newStock.PatternNo || typeof newStock.PatternNo !== "string" || newStock.PatternNo.trim() === "") {
            return NextResponse.json({ error: "PatternNo is required" }, { status: 400 });
        }
        

        // Sanitize string inputs
        for (const key in newStock) {
            if (typeof newStock[key] === "string") {
                newStock[key] = cleanInput(newStock[key]);
            }
        }

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

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A2:A`, // Get PatternNo column only
        });

        const patternNos = response.data.values?.map(row => row[0]) || [];
        patternNos.push(newStock.PatternNo);
        patternNos.sort();

        const insertIndex = patternNos.indexOf(newStock.PatternNo) + 1; // +1 for header

        // Prepare batch update to insert empty row
        const insertRowRequest = {
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        insertDimension: {
                            range: {
                                sheetId: 0, // Sheet1 is usually ID 0; confirm if needed
                                dimension: "ROWS",
                                startIndex: insertIndex,
                                endIndex: insertIndex + 1,
                            },
                            inheritFromBefore: false,
                        },
                    },
                ],
            },
        };

        await sheets.spreadsheets.batchUpdate(insertRowRequest);

        // Add new data into inserted row
        const fullRow = [
            newStock.PatternNo,
            newStock.Quantity || "0",
            newStock.Section || "",
            newStock.Type || "",
            newStock.Colour || "",
            newStock.Tag || "",
            newStock.Price || "0",
            newStock.Repeat || "",
            newStock.Company || "",
            newStock.ImageURL || "",
            newStock.InstallationURL || "",
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A${insertIndex + 1}:K${insertIndex + 1}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [fullRow],
            },
        });

        return NextResponse.json({ message: "Stock added successfully!" }, { status: 200 });
    } catch (error: unknown) {
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
