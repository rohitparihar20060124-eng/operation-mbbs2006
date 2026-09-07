import nodemailer from "nodemailer";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { QUESTION_BANK } from "../src/data/questionBank.js";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 50;
const LINE_H = 16;

async function buildPdfBase64({ subject, chapterName, questions }) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - 60;

  const newPageIfNeeded = (linesNeeded) => {
    if (y - linesNeeded * LINE_H < 60) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - 60;
    }
  };

  page.drawText("NEET Practice Test", { x: MARGIN, y, size: 18, font: bold, color: rgb(0.91, 0.29, 0.02) });
  y -= 24;
  page.drawText(chapterName, { x: MARGIN, y, size: 13, font: bold, color: rgb(0.15, 0.15, 0.15) });
  y -= 20;
  page.drawText(`Subject: ${subject}   •   Format: MCQ   •   Congratulations on finishing this chapter!`, {
    x: MARGIN, y, size: 9.5, font, color: rgb(0.35, 0.35, 0.35)
  });
  y -= 30;

  if (!questions || questions.length === 0) {
    page.drawText("A curated practice set for this chapter is being prepared.", {
      x: MARGIN, y, size: 11, font, color: rgb(0.2, 0.2, 0.2)
    });
    y -= LINE_H;
    page.drawText("In the meantime — great work finishing every lecture here. Keep the momentum going!", {
      x: MARGIN, y, size: 11, font, color: rgb(0.2, 0.2, 0.2)
    });
  } else {
    questions.forEach((q, i) => {
      newPageIfNeeded(2 + q.options.length);
      page.drawText(`${i + 1}. ${q.q}`, { x: MARGIN, y, size: 11, font: bold });
      y -= LINE_H;
      q.options.forEach((opt, oi) => {
        const label = String.fromCharCode(65 + oi);
        page.drawText(`   ${label}. ${opt}`, { x: MARGIN + 10, y, size: 10, font });
        y -= LINE_H;
      });
      y -= 8;
    });

    // Answer key on a fresh page
    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - 60;
    page.drawText("Answer Key", { x: MARGIN, y, size: 14, font: bold });
    y -= 22;
    questions.forEach((q, i) => {
      newPageIfNeeded(1);
      page.drawText(`${i + 1}. ${String.fromCharCode(65 + q.correct)}`, { x: MARGIN, y, size: 10, font });
      y -= 14;
    });
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes).toString("base64");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    return res.status(500).json({
      error: "GMAIL_USER / GMAIL_APP_PASSWORD not set. Add both under Vercel → Project → Settings → Environment Variables."
    });
  }

  try {
    const { email, subject, chapterId, chapterName } = req.body || {};

    if (!email || !chapterId || !chapterName) {
      return res.status(400).json({ error: "Missing required fields: email, chapterId, chapterName." });
    }

    const bank = QUESTION_BANK[chapterId];
    const questions = bank ? bank.questions : [];

    const pdfBase64 = await buildPdfBase64({ subject, chapterName, questions });

    const html = `
      <div style="font-family:sans-serif;line-height:1.6;color:#0f172a">
        <h2 style="color:#ea580c;margin-bottom:0">🎉 Congratulations!</h2>
        <p>You just completed every lecture in <b>${chapterName}</b> (${subject}) on your NEET UG 2027 prep tracker — OPERATION MBBS.</p>
        <p>Attached is a short practice test for this chapter${questions.length ? "" : " (a full question set for this chapter is coming soon)"}. Give it a shot while the concepts are fresh!</p>
        <p style="color:#64748b;font-size:.85rem">Keep going. Every chapter finished is one step closer to AIIMS Delhi.</p>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass }
    });

    await transporter.sendMail({
      from: `"OPERATION MBBS" <${gmailUser}>`,
      to: email,
      subject: `🎉 Chapter Complete: ${chapterName}`,
      html,
      attachments: [
        {
          filename: `${chapterName.replace(/[^a-z0-9]+/gi, "_")}_practice_test.pdf`,
          content: pdfBase64,
          encoding: "base64"
        }
      ]
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
}