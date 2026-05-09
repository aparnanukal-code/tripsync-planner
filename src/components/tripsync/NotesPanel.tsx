import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Send, Trash2, Loader2 } from "lucide-react";
import { MemberAvatar } from "@/components/tripsync/ActivityCard";

export type TripNote = {
  id: string;
  trip_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export function NotesPanel({
  tripId,
  currentUserId,
  memberMap,
  locked,
}: {
  tripId: string;
  currentUserId: string | null;
  memberMap: Record<string, string>;
  locked: boolean;
}) {
  const [notes, setNotes] = useState<TripNote[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("trip_notes")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });
      setNotes((data ?? []) as TripNote[]);
      setLoading(false);
    })();

    const ch = supabase
      .channel(`notes:${tripId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_notes", filter: `trip_id=eq.${tripId}` },
        (p) => {
          if (p.eventType === "INSERT") {
            const n = p.new as TripNote;
            setNotes((prev) => (prev.find((x) => x.id === n.id) ? prev : [...prev, n]));
          } else if (p.eventType === "DELETE") {
            const n = p.old as TripNote;
            setNotes((prev) => prev.filter((x) => x.id !== n.id));
          } else if (p.eventType === "UPDATE") {
            const n = p.new as TripNote;
            setNotes((prev) => prev.map((x) => (x.id === n.id ? n : x)));
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [tripId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !body.trim() || locked) return;
    setBusy(true);
    const text = body.trim().slice(0, 2000);
    const { error } = await supabase
      .from("trip_notes")
      .insert({ trip_id: tripId, user_id: currentUserId, body: text });
    if (!error) setBody("");
    setBusy(false);
  };

  const remove = async (id: string) => {
    await supabase.from("trip_notes").delete().eq("id", id);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Group Notes</h3>
        <span className="text-xs text-muted-foreground">({notes.length})</span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Share thoughts, restaurant tips, or concerns with the group.
      </p>

      <div className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <p className="rounded-lg bg-muted/50 px-3 py-4 text-center text-xs text-muted-foreground">
            No notes yet — be the first to share a thought.
          </p>
        ) : (
          notes.map((n, i) => {
            const name = memberMap[n.user_id] ?? "Member";
            const isMine = n.user_id === currentUserId;
            return (
              <div key={n.id} className="flex gap-2">
                <MemberAvatar name={name} idx={i} />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold">{name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMine && !locked && (
                      <button
                        onClick={() => remove(n.id)}
                        className="ml-auto text-muted-foreground hover:text-destructive"
                        aria-label="Delete note"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap break-words rounded-lg bg-muted/60 px-3 py-2 text-xs text-foreground">
                    {n.body}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!locked && currentUserId && (
        <form onSubmit={submit} className="mt-3 flex gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment for the group…"
            rows={2}
            maxLength={2000}
            className="flex-1 resize-none rounded-lg border border-border bg-card px-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
          <button
            type="submit"
            disabled={busy || !body.trim()}
            className="self-end rounded-lg bg-primary px-3 py-2 text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            aria-label="Send note"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      )}
    </div>
  );
}
