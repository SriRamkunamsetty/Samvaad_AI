import type { ProspectIntel, OutreachResult, ResponseAnalysis, FollowupStrategy } from "./samvaad";
import { auth, db } from "@/lib/firebase";
import { collection, doc, setDoc, getDocs, updateDoc, getDoc, query, orderBy } from "firebase/firestore";

export type RunRecord = {
  id: string;
  created_at: string;
  prospect_label: string | null;
  channel: string | null;
  tone: string | null;
  intel: ProspectIntel | null;
  outreach: OutreachResult | null;
  analysis: ResponseAnalysis | null;
  followup: FollowupStrategy | null;
  sentiment: string | null;
  intent_score: number | null;
  deal_temperature: number | null;
  interest_level: string | null;
  has_response: boolean;
  has_followup: boolean;
  outcome: OutcomeKey | null;
  outcome_at: string | null;
};

export type OutcomeKey =
  | "contacted"
  | "replied"
  | "meeting_booked"
  | "won"
  | "lost"
  | "no_response";

export const OUTCOMES: { key: OutcomeKey; label: string; success: boolean; color: string }[] = [
  { key: "contacted",      label: "Contacted",      success: false, color: "hsl(217 89% 61%)" },
  { key: "replied",        label: "Replied",        success: true,  color: "hsl(250 89% 70%)" },
  { key: "meeting_booked", label: "Meeting booked", success: true,  color: "hsl(280 80% 65%)" },
  { key: "won",            label: "Won",            success: true,  color: "hsl(142 71% 45%)" },
  { key: "lost",           label: "Lost",           success: false, color: "hsl(0 75% 60%)" },
  { key: "no_response",    label: "No response",    success: false, color: "hsl(215 16% 47%)" },
];

const RUN_KEY = "samvaad:current_run_id";
export const getCurrentRunId = () => sessionStorage.getItem(RUN_KEY);
export const setCurrentRunId = (id: string) => sessionStorage.setItem(RUN_KEY, id);
export const clearCurrentRunId = () => sessionStorage.removeItem(RUN_KEY);

function inferLabel(intel: ProspectIntel | null): string {
  if (!intel) return "Untitled prospect";
  return intel.personality_type || "Prospect";
}

const getUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in to save runs");
  return user.uid;
};

export async function saveOutreachRun(args: {
  intel: ProspectIntel;
  outreach: OutreachResult;
  channel: string;
  tone: string;
}): Promise<string | null> {
  const uid = getUserId();
  const id = `run_${Date.now()}`;
  const run: RunRecord = {
    id,
    created_at: new Date().toISOString(),
    prospect_label: inferLabel(args.intel),
    channel: args.channel,
    tone: args.tone,
    intel: args.intel,
    outreach: args.outreach,
    analysis: null,
    followup: null,
    sentiment: null,
    intent_score: null,
    deal_temperature: null,
    interest_level: null,
    has_response: false,
    has_followup: false,
    outcome: null,
    outcome_at: null,
  };
  
  await setDoc(doc(db, "users", uid, "outreach", id), run);
  return id;
}

export async function attachAnalysis(id: string, analysis: ResponseAnalysis): Promise<void> {
  const uid = getUserId();
  const ref = doc(db, "users", uid, "outreach", id);
  await updateDoc(ref, {
    has_response: true,
    analysis,
    sentiment: analysis.sentiment,
    outcome: "replied"
  });
}

export async function attachFollowup(id: string, followup: FollowupStrategy): Promise<void> {
  const uid = getUserId();
  const ref = doc(db, "users", uid, "outreach", id);
  await updateDoc(ref, {
    has_followup: true,
    followup
  });
}

export async function fetchRuns(): Promise<RunRecord[]> {
  const uid = getUserId();
  const runsRef = collection(db, "users", uid, "outreach");
  const q = query(runsRef, orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as RunRecord);
}

export async function setRunOutcome(id: string, outcome: OutcomeKey | null): Promise<void> {
  const uid = getUserId();
  const ref = doc(db, "users", uid, "outreach", id);
  await updateDoc(ref, {
    outcome_at: new Date().toISOString(),
    outcome
  });
}

export async function createShareLink(payload: any): Promise<string | null> {
  // Share links can be public, so they are stored outside user-specific space
  const id = `share_${Date.now()}`;
  await setDoc(doc(db, "shared", id), { payload, created_at: new Date().toISOString() });
  return id;
}

export async function fetchShareLink(shareId: string): Promise<{ payload: any; created_at: string } | null> {
  const snapshot = await getDoc(doc(db, "shared", shareId));
  if (!snapshot.exists()) return null;
  return snapshot.data() as { payload: any; created_at: string };
}
