export const VIBES = ["Food","Nightlife","Adventure","Relaxed","Culture","Photography","Shopping","Family"] as const;
export const BUDGETS = [
  { value: "Budget", label: "💰 Budget" },
  { value: "Mid-range", label: "💳 Mid-range" },
  { value: "Premium", label: "💎 Premium" },
] as const;

export const CATEGORIES = [
  { value: "Food", emoji: "🍕" },
  { value: "Culture", emoji: "🏛️" },
  { value: "Nightlife", emoji: "🎵" },
  { value: "Adventure", emoji: "🏄" },
  { value: "Photography", emoji: "📷" },
  { value: "Shopping", emoji: "🛍️" },
  { value: "Relaxation", emoji: "🛁" },
  { value: "Sightseeing", emoji: "🗺️" },
] as const;

export const CATEGORY_EMOJI: Record<string,string> = Object.fromEntries(CATEGORIES.map(c => [c.value, c.emoji]));

export const AVATAR_COLORS = [
  "bg-[#7C3AED]","bg-[#F97316]","bg-[#14B8A6]","bg-amber-500","bg-[#7C3AED]","bg-[#F97316]"
];

export const colorForUser = (id: string | null | undefined, idx?: number) => {
  if (typeof idx === "number") return AVATAR_COLORS[idx % AVATAR_COLORS.length];
  if (!id) return AVATAR_COLORS[0];
  let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

export const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0,2).map(s => s[0]?.toUpperCase() ?? "").join("") || "?";

export const BARCELONA_FALLBACK = {
  days: [
    { day: 1, date: "2025-09-12", activities: [
      { time: "09:00", title: "Gothic Quarter Walk", duration: "2 hours", cost_estimate: "€0", category: "Culture", reason: "Iconic free start to Barcelona.", source: "ai_suggested" },
      { time: "13:00", title: "Tapas at La Boqueria", duration: "1.5 hours", cost_estimate: "€20", category: "Food", reason: "Best market, loved by all vibes.", source: "ai_suggested" },
      { time: "20:00", title: "Rooftop Cocktails", duration: "2 hours", cost_estimate: "€25", category: "Nightlife", reason: "Alex's personal pick — 3 ❤️ from group.", source: "user_added" },
    ]},
    { day: 2, date: "2025-09-13", activities: [
      { time: "09:30", title: "Sagrada Família", duration: "2.5 hours", cost_estimate: "€26", category: "Culture", reason: "4 ❤️ votes. Unmissable Barcelona landmark.", source: "ai_suggested" },
      { time: "14:00", title: "Beach Day at Barceloneta", duration: "3 hours", cost_estimate: "€0", category: "Relaxation", reason: "3 ❤️ votes. Perfect afternoon unwind.", source: "ai_suggested" },
      { time: "20:30", title: "Flamenco Show", duration: "1.5 hours", cost_estimate: "€35", category: "Culture", reason: "Priya's pick — 4 ❤️ votes.", source: "user_added" },
    ]},
  ],
  harmony_score: 84,
  harmony_breakdown: {
    demo_user_1: { name: "Alex",  score: 88, tooltip: "3 of Alex's top picks included" },
    demo_user_2: { name: "Sarah", score: 79, tooltip: "2 of Sarah's top picks included" },
    demo_user_3: { name: "Priya", score: 91, tooltip: "4 of Priya's top picks included" },
    demo_user_4: { name: "Tom",   score: 78, tooltip: "2 of Tom's top picks included" },
  },
  optimization_summary: "Balanced food, culture, and nightlife across all days.",
};

export type Itinerary = typeof BARCELONA_FALLBACK;
