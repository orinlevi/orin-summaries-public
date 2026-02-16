import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { isAuthorized, getPayloadFromRequest, isAdmin } from "@/lib/auth";

/** MIME types for the file extensions we serve */
const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".ipynb": "application/x-ipynb+json",
  ".py": "text/x-python",
};

const SITE_URL = "https://orin-summaries.vercel.app";

/** Generate a simple PDF with a paywall message for unauthorized users */
function buildPaywallPdf(): Uint8Array {
  // Minimal valid PDF with Hebrew-friendly message
  const lines = [
    "%PDF-1.4",
    "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj",
    "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj",
    "",
  ];

  const textLines = [
    "BT",
    "/F1 28 Tf",
    "220 600 Td",
    "(Orin Summaries) Tj",
    "/F1 16 Tf",
    "0 -50 Td",
    "(This file is available to subscribers only.) Tj",
    "/F1 13 Tf",
    "0 -35 Td",
    `(Get full access at: ${SITE_URL}) Tj`,
    "0 -30 Td",
    "(Thank you for your interest!) Tj",
    "ET",
  ];

  const stream = textLines.join("\n");
  lines.push(
    `4 0 obj<</Length ${stream.length}>>stream\n${stream}\nendstream\nendobj`
  );

  const body = lines.join("\n");
  const xrefOffset = body.length;
  const xref = [
    "xref",
    "0 6",
    "0000000000 65535 f ",
    ...Array.from({ length: 5 }, (_, i) => {
      const offset = body.indexOf(`${i + 1} 0 obj`);
      return String(offset).padStart(10, "0") + " 00000 n ";
    }),
    "trailer<</Size 6/Root 1 0 R>>",
    "startxref",
    String(xrefOffset),
    "%%EOF",
  ].join("\n");

  return new TextEncoder().encode(body + xref);
}

/**
 * GET /api/download?file=/assets/cs1001/code/basics_demo.py
 * GET /api/download?file=/admin-assets/calculus1b/exam_2024.pdf
 *
 * Serves protected files after checking authorization.
 * - /assets/…  → served from `private-assets/` (requires login)
 * - /admin-assets/… → served from `admin-assets/` (requires admin)
 */
export async function GET(request: NextRequest) {
  const fileParam = request.nextUrl.searchParams.get("file");
  if (!fileParam) {
    return NextResponse.json(
      { error: "missing ?file= parameter" },
      { status: 400 }
    );
  }

  /* ── determine source directory and auth level ───────────────── */
  const isAdminAsset = fileParam.startsWith("/admin-assets/");

  if (isAdminAsset) {
    // Admin-only files: must be logged in AND be an admin
    const payload = getPayloadFromRequest(request);
    if (!payload || !isAdmin(payload.email)) {
      return NextResponse.json(
        { error: "forbidden" },
        { status: 403 }
      );
    }
  } else {
    // Regular protected files: must be logged in
    if (!isAuthorized(request)) {
      const pdf = buildPaywallPdf();
      return new Response(pdf as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="orin-summaries-subscribe.pdf"',
          "Content-Length": String(pdf.length),
        },
      });
    }
  }

  /* ── resolve file path ──────────────────────────────────────── */
  let baseDir: string;
  let relative: string;

  if (isAdminAsset) {
    baseDir = "admin-assets";
    relative = fileParam.replace(/^\/admin-assets\//, "");
  } else {
    baseDir = "private-assets";
    relative = fileParam.replace(/^\/assets\//, "");
  }

  // Security: prevent path traversal
  const resolved = path.resolve(process.cwd(), baseDir, relative);
  const safeDir = path.resolve(process.cwd(), baseDir);
  if (!resolved.startsWith(safeDir)) {
    return NextResponse.json(
      { error: "invalid path" },
      { status: 400 }
    );
  }

  if (!fs.existsSync(resolved)) {
    return NextResponse.json(
      { error: "file not found" },
      { status: 404 }
    );
  }

  /* ── serve ──────────────────────────────────────────────────── */
  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const fileName = path.basename(resolved);

  const fileBuffer = fs.readFileSync(resolved);
  const bytes = new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength);

  return new Response(bytes as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": String(bytes.length),
    },
  });
}
