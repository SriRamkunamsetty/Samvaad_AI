import jsPDF from "jspdf";
import type { ProspectIntel, OutreachResult, ResponseAnalysis, FollowupStrategy } from "./samvaad";

export type ExportPayload = {
  intel?: ProspectIntel | null;
  outreach?: OutreachResult | null;
  analysis?: ResponseAnalysis | null;
  followup?: FollowupStrategy | null;
  channel?: string;
  tone?: string;
  generatedAt?: string;
};

// Brand colors (Modern Dark Glass)
const BRAND_BLUE: [number, number, number] = [66, 133, 244];
const BRAND_PURPLE: [number, number, number] = [137, 87, 229];
const INK: [number, number, number] = [30, 35, 50];
const MUTED: [number, number, number] = [110, 118, 138];
const RULE: [number, number, number] = [228, 230, 240];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

export function exportSamvaadPDF(payload: ExportPayload, filename = "samvaad-report.pdf") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 0;

  const ensure = (need: number) => {
    if (y + need > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
      pageHeader(false);
    }
  };

  const pageHeader = (firstPage: boolean) => {
    // Top brand bar
    doc.setFillColor(...BRAND_BLUE);
    doc.rect(0, 0, PAGE_W, firstPage ? 36 : 12, "F");
    if (firstPage) {
      // Gradient effect with second band
      doc.setFillColor(...BRAND_PURPLE);
      doc.rect(0, 30, PAGE_W, 6, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("SAMVAAD AI", MARGIN, 16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Relationship Intelligence Report", MARGIN, 22);
      const date = payload.generatedAt
        ? new Date(payload.generatedAt).toLocaleString()
        : new Date().toLocaleString();
      doc.text(date, PAGE_W - MARGIN, 22, { align: "right" });
      y = 48;
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("SAMVAAD AI", MARGIN, 8);
      y = 22;
    }
    doc.setTextColor(...INK);
  };

  const sectionTitle = (text: string) => {
    ensure(14);
    doc.setFillColor(...BRAND_BLUE);
    doc.rect(MARGIN, y, 1.6, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text(text, MARGIN + 4, y + 5);
    y += 10;
  };

  const subTitle = (text: string) => {
    ensure(8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(text.toUpperCase(), MARGIN, y);
    y += 5;
  };

  const body = (text: string, opts: { size?: number; color?: [number, number, number]; bold?: boolean } = {}) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size ?? 10.5);
    doc.setTextColor(...(opts.color ?? INK));
    const lines = doc.splitTextToSize(text, CONTENT_W);
    for (const line of lines) {
      ensure(6);
      doc.text(line, MARGIN, y);
      y += 5;
    }
  };

  const indentedBody = (text: string, indent = 6) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(text, CONTENT_W - indent);
    for (const line of lines) {
      ensure(5.5);
      doc.text(line, MARGIN + indent, y);
      y += 4.8;
    }
  };

  const bullet = (text: string) => {
    ensure(6);
    doc.setFillColor(...BRAND_BLUE);
    doc.circle(MARGIN + 1.5, y - 1.5, 0.9, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(text, CONTENT_W - 6);
    doc.text(lines[0], MARGIN + 5, y);
    y += 5;
    for (let i = 1; i < lines.length; i++) {
      ensure(5);
      doc.text(lines[i], MARGIN + 5, y);
      y += 5;
    }
  };

  const card = (drawInner: () => void, padding = 5) => {
    const startY = y;
    y += padding;
    drawInner();
    y += padding;
    // Draw rectangle behind content
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.2);
    doc.roundedRect(MARGIN, startY, CONTENT_W, y - startY, 2, 2, "S");
    y += 4;
  };

  const kv = (label: string, value: string) => {
    ensure(6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), MARGIN + 3, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(value, CONTENT_W - 50);
    doc.text(lines[0], MARGIN + 38, y);
    y += 5;
    for (let i = 1; i < lines.length; i++) {
      ensure(5);
      doc.text(lines[i], MARGIN + 38, y);
      y += 5;
    }
  };

  const meter = (label: string, value: number) => {
    ensure(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), MARGIN, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(`${value}/100`, PAGE_W - MARGIN, y, { align: "right" });
    y += 2;
    // Track
    doc.setFillColor(235, 238, 245);
    doc.roundedRect(MARGIN, y, CONTENT_W, 2.5, 1.25, 1.25, "F");
    // Fill
    const fill = Math.max(2, (CONTENT_W * Math.min(100, Math.max(0, value))) / 100);
    doc.setFillColor(...BRAND_BLUE);
    doc.roundedRect(MARGIN, y, fill, 2.5, 1.25, 1.25, "F");
    y += 8;
  };

  // ---- Render document ----
  pageHeader(true);

  // 1. Prospect Intelligence
  if (payload.intel) {
    sectionTitle("Prospect Intelligence");
    card(() => {
      kv("Personality", payload.intel!.personality_type);
      kv("Comm. style", payload.intel!.communication_style);
      kv("Decision style", payload.intel!.decision_style);
      kv("Recommended tone", payload.intel!.recommended_tone);
      kv("Confidence", `${payload.intel!.confidence}%`);
    });
    subTitle("Summary");
    body(payload.intel.personality_summary);
    y += 2;
    subTitle("Persuasion strategy");
    body(payload.intel.persuasion_strategy);
    y += 2;
    subTitle("Emotional hooks");
    payload.intel.emotional_hooks.forEach(bullet);
    y += 2;
    subTitle("Pain points");
    payload.intel.pain_points.forEach(bullet);
    y += 2;
    subTitle("Likely objections");
    payload.intel.likely_objections.forEach(bullet);
    y += 4;
  }

  // 2. Outreach
  if (payload.outreach) {
    sectionTitle("Outreach Message");
    if (payload.channel || payload.tone) {
      body(`${payload.channel ?? ""}${payload.channel && payload.tone ? " · " : ""}${payload.tone ?? ""}`,
        { size: 9, color: MUTED });
      y += 1;
    }
    if (payload.outreach.subject) {
      kv("Subject", payload.outreach.subject);
      y += 1;
    }
    card(() => indentedBody(payload.outreach!.message, 0));

    // Reasoning
    sectionTitle("Why The AI Wrote This");
    payload.outreach.reasoning.forEach((r, i) => {
      ensure(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...BRAND_BLUE);
      doc.text(String(i + 1).padStart(2, "0"), MARGIN, y);
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      const titleLines = doc.splitTextToSize(r.decision, CONTENT_W - 8);
      doc.text(titleLines[0], MARGIN + 7, y);
      y += 5;
      for (let k = 1; k < titleLines.length; k++) {
        ensure(5);
        doc.text(titleLines[k], MARGIN + 7, y);
        y += 5;
      }
      indentedBody(r.why, 7);
      y += 2;
    });
  }

  // 3. Response analysis
  if (payload.analysis) {
    sectionTitle("Response Analysis");
    meter("Intent score", payload.analysis.intent_score);
    meter("Deal temperature", payload.analysis.deal_temperature);
    card(() => {
      kv("Sentiment", payload.analysis!.sentiment);
      kv("Interest level", payload.analysis!.interest_level);
      kv("Urgency", payload.analysis!.urgency);
      kv("Objection", payload.analysis!.objection_type);
    });
    subTitle("Objection analysis");
    body(payload.analysis.objection_analysis);
    y += 1;
    subTitle("Emotional state");
    body(payload.analysis.emotional_state);
    y += 1;
    subTitle("Suggested next move");
    body(payload.analysis.suggested_next_move, { bold: true });
    y += 1;
    subTitle("Recommended reply");
    card(() => indentedBody(payload.analysis!.recommended_reply, 0));
  }

  // 4. Follow-up timeline
  if (payload.followup) {
    sectionTitle("Follow-Up Strategy");
    card(() => {
      kv("Wait", `${payload.followup!.wait_hours} hours`);
      kv("Channel", payload.followup!.channel);
      kv("Tone", payload.followup!.tone);
      kv("Urgency", payload.followup!.urgency);
      kv("Confidence", `${payload.followup!.confidence}%`);
    });
    subTitle("Persuasion angle");
    body(payload.followup.persuasion_angle);
    y += 1;
    subTitle("Rationale");
    body(payload.followup.rationale);
    y += 1;

    // Timeline visual
    subTitle("Timeline");
    const items = [
      { time: "Now", title: "Reply received & analyzed" },
      { time: `+${payload.followup.wait_hours}h`, title: `Send ${payload.followup.channel} · ${payload.followup.tone} tone` },
      { time: "Then", title: payload.followup.persuasion_angle },
    ];
    items.forEach((it, i) => {
      ensure(12);
      // Dot
      doc.setFillColor(...BRAND_BLUE);
      doc.circle(MARGIN + 2, y + 1.5, 1.4, "F");
      // Connector line
      if (i < items.length - 1) {
        doc.setDrawColor(...BRAND_BLUE);
        doc.setLineWidth(0.4);
        doc.line(MARGIN + 2, y + 3, MARGIN + 2, y + 12);
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      doc.text(it.time, MARGIN + 7, y + 1);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      const titleLines = doc.splitTextToSize(it.title, CONTENT_W - 12);
      doc.text(titleLines[0], MARGIN + 7, y + 5);
      y += 6;
      for (let k = 1; k < titleLines.length; k++) {
        ensure(5);
        doc.text(titleLines[k], MARGIN + 7, y);
        y += 5;
      }
      y += 4;
    });

    subTitle("Recommended message");
    card(() => indentedBody(payload.followup!.recommended_message, 0));
  }

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Generated by Samvaad AI · samvaad.ai", MARGIN, PAGE_H - 8);
    doc.text(`Page ${i} of ${pages}`, PAGE_W - MARGIN, PAGE_H - 8, { align: "right" });
  }

  doc.save(filename);
}
