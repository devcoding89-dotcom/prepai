import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No PDF supplied" }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "PDF is larger than 20 MB" }, { status: 400 });
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }

  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: Buffer.from(await file.arrayBuffer()) });
    const result = await parser.getText();
    await parser.destroy();
    if (result.text.trim()) {
      return NextResponse.json({ text: result.text, pages: result.total, filename: file.name, source: "text" });
    }

    const ocrKey = process.env.OCR_SPACE_API_KEY;
    if (!ocrKey) {
      return NextResponse.json({ error: "This PDF is scanned and OCR_SPACE_API_KEY is not configured." }, { status: 422 });
    }

    const ocrForm = new FormData();
    ocrForm.append("apikey", ocrKey);
    ocrForm.append("language", "eng");
    ocrForm.append("isOverlayRequired", "false");
    ocrForm.append("file", new File([await file.arrayBuffer()], file.name, { type: "application/pdf" }));
    const ocrResponse = await fetch("https://api.ocr.space/parse/image", { method: "POST", body: ocrForm });
    const ocrPayload = (await ocrResponse.json()) as {
      IsErroredOnProcessing?: boolean;
      ErrorMessage?: string | string[];
      ParsedResults?: { ParsedText?: string }[];
    };
    if (!ocrResponse.ok || ocrPayload.IsErroredOnProcessing) {
      const message = Array.isArray(ocrPayload.ErrorMessage) ? ocrPayload.ErrorMessage.join(" ") : ocrPayload.ErrorMessage;
      throw new Error(message || "OCR.space could not process this PDF.");
    }
    const text = (ocrPayload.ParsedResults ?? []).map((page) => page.ParsedText ?? "").join("\n\n").trim();
    if (!text) throw new Error("OCR.space returned no readable text. Try a clearer scan.");
    return NextResponse.json({ text, pages: ocrPayload.ParsedResults?.length ?? result.total, filename: file.name, source: "ocr" });
  } catch (error) {
    console.error("[admin/questions/parse-pdf] failed", error);
    return NextResponse.json({ error: "Could not extract text from this PDF. Scanned PDFs need OCR." }, { status: 422 });
  }
}
