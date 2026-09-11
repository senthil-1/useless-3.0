import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { verifyAuthToken } from "@/lib/server-auth";

export const ALLOWED_DEPARTMENTS = [
  "Department of Excessive Waiting",
  "Department of Unnecessary Paperwork",
  "Department of Minor Inconveniences",
  "Department of Lost Things",
  "Department of Government Confusion",
  "Department of Administrative Delays",
  "Department of Completely Unnecessary Requests",
  "Department of Public Complaints",
  "Department of Bureaucratic Affairs",
  "Department of Miscellaneous Uselessness",
] as const;

export const ALLOWED_STATUSES = [
  "Submitted",
  "Under Review",
  "Escalated",
  "Approved",
  "Rejected",
  "Resolved",
] as const;

interface AiResponseStructure {
  department: string;
  status: string;
  finalDecision: string;
  certificateTitle: string;
  certificateValue: string;
}

export async function POST(req: Request) {
  try {
    // 1. Verify Authentication
    const authUser = await verifyAuthToken(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthenticated. Official citizen credentials required." },
        { status: 401 }
      );
    }

    // 2. Parse & Validate Request Body
    const body = await req.json().catch(() => null);
    if (!body || !body.caseId || !body.caseType) {
      return NextResponse.json(
        { success: false, error: "Invalid request. Missing caseId or caseType." },
        { status: 400 }
      );
    }

    const { caseId, caseType } = body;
    if (caseType !== "incident" && caseType !== "certificate") {
      return NextResponse.json(
        { success: false, error: "Invalid caseType. Must be 'incident' or 'certificate'." },
        { status: 400 }
      );
    }

    const collectionName = caseType === "incident" ? "incidents" : "certificateRequests";

    // 3. Read Case from Firestore
    const caseRef = doc(db, collectionName, caseId);
    let caseSnap;
    try {
      caseSnap = await getDoc(caseRef);
    } catch (dbErr: any) {
      console.warn("MUA AI — Could not read from Firestore directly:", dbErr);
    }

    let caseData: any = null;
    if (caseSnap && caseSnap.exists()) {
      caseData = caseSnap.data();
    } else {
      // Fallback: Check if client supplied case payload for newly created local records
      if (body.caseData && body.caseData.id === caseId) {
        caseData = body.caseData;
      }
    }

    if (!caseData) {
      return NextResponse.json(
        { success: false, error: "Case not found in Ministry records." },
        { status: 404 }
      );
    }

    // 4. Verify Ownership
    if (caseData.userId !== authUser.uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Citizen does not own this case." },
        { status: 403 }
      );
    }

    // 5. Check If Already Processed (Idempotent)
    if (caseData.aiProcessed && caseData.finalDecision && caseData.department) {
      return NextResponse.json({
        success: true,
        case: caseData,
        cached: true,
      });
    }

    // 6. Build Controlled Gemini Prompt
    const gemini = getGeminiClient();

    const systemInstruction = `You are the official AI administrative processor of the fictional Ministry of Useless Affairs.
You process citizen cases involving unnecessary incidents, minor inconveniences, bureaucratic confusion, and requests for unnecessary certificates.
Use professional government terminology with subtle bureaucratic humor.
You MUST return valid JSON matching the supplied schema.
Choose exactly one department from this allowed list:
${ALLOWED_DEPARTMENTS.map((d) => `- "${d}"`).join("\n")}

Choose exactly one status from this allowed list:
${ALLOWED_STATUSES.map((s) => `- "${s}"`).join("\n")}

Write a concise but entertaining final bureaucratic decision (2-3 sentences max).
Do not invent citizen identity information, citizen IDs, or case IDs.
Do not modify user identity, citizenship status, rank, or useless points.
Do not include markdown or text outside the JSON.
For certificate requests, generate an appropriate certificate title and concise certificate value (e.g. "EXTRAORDINARY BUREAUCRATIC PATIENCE", "LEVEL IV ADMINISTRATIVE ENDURANCE").
For incident cases, assign an appropriate department and status (e.g. Under Review or Escalated) and a fitting certificate title/value.
The result should sound like an unnecessarily serious government decision.`;

    const userPrompt = `PROCESS THIS OFFICIAL CITIZEN CASE:
Case ID: ${caseId}
Case Type: ${caseType === "incident" ? "Incident Report" : "Certificate Request"}
Citizen Name: ${caseData.citizenName || authUser.displayName || "Distinguished Citizen"}
Title/Type: ${caseData.title || caseData.certificateType || "Untitled Case"}
Category/Purpose: ${caseData.category || caseData.purpose || "General Bureaucratic Affair"}
Description/Notes: ${caseData.description || caseData.notes || "No additional commentary provided."}
Severity: ${caseData.severity || "Moderate"}
Location: ${caseData.location || "General Vicinity"}

Return JSON conforming strictly to:
{
  "department": "One of the allowed departments exactly",
  "status": "One of the allowed statuses exactly",
  "finalDecision": "Concise official government decision statement",
  "certificateTitle": "Official certificate title",
  "certificateValue": "SHORT UPPERCASE AWARDED VALUE (max 40 chars)"
}`;

    // 7. Call Gemini
    const geminiResponse = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const responseText = geminiResponse.text || "";
    let parsed: AiResponseStructure;

    try {
      parsed = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("MUA AI — Failed to parse Gemini response:", responseText);
      throw new Error("Invalid structured JSON returned from Gemini.");
    }

    // 8. Validate & Sanitize Response
    let department = parsed.department?.trim();
    if (!ALLOWED_DEPARTMENTS.includes(department as any)) {
      department =
        caseType === "certificate"
          ? "Department of Bureaucratic Affairs"
          : "Department of Minor Inconveniences";
    }

    let status = parsed.status?.trim();
    if (!ALLOWED_STATUSES.includes(status as any)) {
      status = caseType === "certificate" ? "Approved" : "Under Review";
    }

    const finalDecision =
      parsed.finalDecision?.trim() ||
      "The Ministry has formally examined the trivialities presented and determined that bureaucratic procedures must proceed unimpeded.";

    const certificateTitle =
      parsed.certificateTitle?.trim() ||
      (caseType === "certificate"
        ? caseData.certificateType || "Certificate of Bureaucratic Excellence"
        : "Certificate of Administrative Endurance");

    const certificateValue = (
      parsed.certificateValue?.trim() || "EXTRAORDINARY BUREAUCRATIC ENDURANCE"
    )
      .toUpperCase()
      .slice(0, 50);

    const updatedData = {
      ...caseData,
      department,
      status,
      finalDecision,
      certificateTitle,
      certificateValue,
      aiProcessed: true,
      aiProcessedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 9. Save to Firestore asynchronously
    try {
      await updateDoc(caseRef, {
        department,
        status,
        finalDecision,
        certificateTitle,
        certificateValue,
        aiProcessed: true,
        aiProcessedAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });
    } catch (saveErr) {
      console.warn("MUA AI — Could not update Firestore directly (saved locally):", saveErr);
    }

    // 10. Return Processed Case
    return NextResponse.json({
      success: true,
      case: updatedData,
    });
  } catch (error: any) {
    console.error("MUA Process Case Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "The Ministry's AI processing division is temporarily swamped with paperwork.",
        canRetry: true,
      },
      { status: 500 }
    );
  }
}
