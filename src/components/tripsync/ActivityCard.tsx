import { motion } from "framer-motion";
import { CATEGORY_EMOJI, colorForUser, initials } from "@/lib/tripsync/constants";

export type Activity = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  ai_insight: string | null;
  is_ai_suggested: boolean;
  added_by: string | null;
};

export type Vote = { activity_id: string; user_id: string; vote_type: "must_do"|"interested"|"skip" };

const VOTE_META = {
  must_do: { emoji: "❤️", active: "bg-danger text-white border-danger", soft: "border-danger/30 text-danger" },
  interested: { emoji: "🤔", active: "bg-primary text-primary-foreground border-primary", soft: "border-primary/30 text-primary" },
  skip: { emoji: "😐", active: "bg-muted-foreground text-white border-muted-foreground", soft: "border-muted-foreground/30 text-muted-foreground" },
} as const;

export function ActivityCard({
  activity, votes, currentUserId, addedByName, locked, onVote,
}: {
  activity: Activity;
  votes: Vote[];
  currentUserId: string | null;
  addedByName?: string;
  locked: boolean;
  onVote: (type: "must_do"|"interested"|"skip") => void;
}) {
  const myVote = votes.find((v) => v.user_id === currentUserId)?.vote_type;
  const counts = { must_do: 0, interested: 0, skip: 0 };
  for (const v of votes) counts[v.vote_type]++;

  const cardClass = locked
    ? "bg-muted/40 opacity-60 pointer-events-none"
    : myVote === "must_do"
    ? "bg-red-50 border-red-200"
    : myVote
    ? "bg-primary-light border-primary/30"
    : "bg-white border-border hover:border-primary/40 hover:shadow-lg";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border p-4 shadow-md transition-all duration-150 ${cardClass}`}
    >
      {myVote && (
        <span className={`absolute left-0 top-3 h-[calc(100%-1.5rem)] w-[3px] rounded-r ${myVote === "must_do" ? "bg-danger/70" : "bg-primary/70"}`} />
      )}
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none">{CATEGORY_EMOJI[activity.category] ?? "🗺️"}</span>
        <h3 className="text-sm font-semibold text-foreground">{activity.title}</h3>
      </div>
      <div className="my-2 border-t border-border/60" />
      {activity.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">{activity.description}</p>
      )}
      <div className="mt-2">
        {activity.is_ai_suggested ? (
          activity.ai_insight && (
            <span className="inline-flex items-center gap-1 rounded-md bg-accent-light px-2 py-0.5 text-[11px] font-medium text-amber-700">
              🔍 {activity.ai_insight}
            </span>
          )
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md bg-primary-light px-2 py-0.5 text-[11px] font-medium text-primary">
            ✦ Your pick · by {addedByName ?? "Member"}
          </span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {(["must_do","interested","skip"] as const).map((t) => {
          const meta = VOTE_META[t];
          const active = myVote === t;
          return (
            <motion.button
              key={t}
              type="button"
              disabled={locked}
              onClick={() => onVote(t)}
              animate={{ scale: active ? 1.0 : 1 }}
              whileTap={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
              className={`flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-xs font-medium transition ${active ? meta.active : "border-border bg-card text-foreground hover:" + meta.soft}`}
            >
              <span>{meta.emoji}</span>
              <span>{counts[t]}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export function MemberAvatar({ name, idx, size = "sm" }: { name: string; idx: number; size?: "sm" | "md" }) {
  const dim = size === "md" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";
  return (
    <div className={`grid ${dim} place-items-center rounded-full font-bold text-white ring-2 ring-white ${colorForUser(name, idx)}`} title={name}>
      {initials(name)}
    </div>
  );
}
