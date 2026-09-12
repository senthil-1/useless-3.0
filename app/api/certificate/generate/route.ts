import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { verifyAuthToken } from "@/lib/server-auth";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("caseId");
    const caseType = searchParams.get("caseType") || "certificate";

    if (!caseId) {
      return new NextResponse("Missing caseId parameter", { status: 400 });
    }

    // 1. Verify Authentication
    const authUser = await verifyAuthToken(req);
    if (!authUser) {
      return new NextResponse("Unauthorized. Please provide a valid citizen token.", {
        status: 401,
      });
    }

    // 2. Fetch case from Firestore or fallback query params
    const collectionName = caseType === "incident" ? "incidents" : "certificateRequests";
    let caseData: any = null;

    try {
      const snap = await getDoc(doc(db, collectionName, caseId));
      if (snap.exists()) {
        caseData = snap.data();
      }
    } catch (e) {
      console.warn("Could not read case from Firestore for certificate:", e);
    }

    // If not found in primary collection, try alternate collection
    if (!caseData) {
      const altCollection = caseType === "incident" ? "certificateRequests" : "incidents";
      try {
        const altSnap = await getDoc(doc(db, altCollection, caseId));
        if (altSnap.exists()) {
          caseData = altSnap.data();
        }
      } catch {}
    }

    // Allow user-owned fallback params if Firestore is offline
    const clientName = searchParams.get("citizenName");
    const clientVal = searchParams.get("certificateValue");

    const citizenName =
      caseData?.citizenName ||
      clientName ||
      authUser.displayName ||
      "Distinguished Citizen";

    const rawValue =
      caseData?.certificateValue ||
      clientVal ||
      caseData?.certificateTitle ||
      caseData?.certificateRequest ||
      caseData?.certificateType ||
      "EXTRAORDINARY BUREAUCRATIC EXCELLENCE";

    const certificateValue = rawValue.toUpperCase();

    const createdDate = caseData?.createdAt?.toDate
      ? caseData.createdAt.toDate()
      : caseData?.createdAt
      ? new Date(caseData.createdAt)
      : new Date();

    const formattedDate = createdDate
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();

    // 3. Dynamic Font Sizing
    // Template is 1536 x 1024, Center X is 768
    let nameFontSize = 38;
    if (citizenName.length > 35) nameFontSize = 24;
    else if (citizenName.length > 25) nameFontSize = 30;
    else if (citizenName.length > 18) nameFontSize = 34;

    let valFontSize = 26;
    if (certificateValue.length > 45) valFontSize = 17;
    else if (certificateValue.length > 35) valFontSize = 20;
    else if (certificateValue.length > 25) valFontSize = 23;

    // 4. Construct SVG Overlay
    const svgOverlay = `
      <svg width="1536" height="1024" xmlns="http://www.w3.org/2000/svg">
        <style>
          .name {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-weight: bold;
            font-style: italic;
            fill: #172235;
            text-anchor: middle;
          }
          .value {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-weight: 900;
            letter-spacing: 2px;
            fill: #9b1c31;
            text-anchor: middle;
          }
          .date {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-weight: bold;
            fill: #172235;
            letter-spacing: 1px;
          }
          .caseId {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            fill: #687386;
            text-anchor: end;
          }
        </style>

        <!-- Citizen Name: between "THIS IS TO CERTIFY THAT" and "HAS BEEN AWARDED THE" -->
        <text x="768" y="488" class="name" font-size="${nameFontSize}">${escapeXml(citizenName)}</text>

        <!-- Certificate Value: between "HAS BEEN AWARDED THE" and appreciation paragraph -->
        <text x="768" y="597" class="value" font-size="${valFontSize}">${escapeXml(certificateValue)}</text>

        <!-- Official Date: directly in the "DATE :" line area -->
        <text x="1220" y="926" class="date" font-size="17">${escapeXml(formattedDate)}</text>

        <!-- Case Identifier: discreet top right corner -->
        <text x="1450" y="55" class="caseId" font-size="12">${escapeXml(caseId)}</text>
      </svg>
    `;

    // 5. Load Template and Overlay with Sharp
    const templatePath = path.join(process.cwd(), "public", "certificate-template.png");
    const templateBuffer = await fs.readFile(templatePath);

    const certificatePng = await sharp(templateBuffer)
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0,
        },
      ])
      .png({ quality: 100 })
      .toBuffer();

    return new NextResponse(certificatePng, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="MUA-Certificate-${caseId}.png"`,
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch (error: any) {
    console.error("Certificate Generation Error:", error);
    return new NextResponse(
      `Failed to generate official certificate: ${error?.message || error}`,
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Support POST with JSON body as well
  try {
    const body = await req.json().catch(() => ({}));
    const caseId = body.caseId;
    const caseType = body.caseType || "certificate";

    if (!caseId) {
      return NextResponse.json({ error: "Missing caseId" }, { status: 400 });
    }

    const url = new URL(req.url);
    url.searchParams.set("caseId", caseId);
    url.searchParams.set("caseType", caseType);
    if (body.token) url.searchParams.set("token", body.token);

    return GET(new NextRequest(url.toString(), { headers: req.headers }));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
