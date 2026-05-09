import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { CATEGORIES } from "@/lib/tripsync/constants";
import { Plus, X } from "lucide-react";

export function AddActivityForm({ onAdd, disabled }: { onAdd: (a: { title: string; description: string; category: string }) => Promise<void>; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState<string>("Sightseeing");
  const [busy, setBusy] = useState(false);

  if (disabled) return null;

  return (
    <div>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-white px-4 py-3 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary-light">
          <Plus className="h-4 w-4" strokeWidth={2.5} /> Add Mine
        </button>
      )}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div layout initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!title.trim()) return;
                setBusy(true);
                try { await onAdd({ title: title.trim(), description: desc.trim(), category: cat }); setOpen(false); setTitle(""); setDesc(""); }
                finally { setBusy(false); }
              }}
              className="space-y-3 rounded-2xl border border-border bg-white p-4 shadow-md"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Add an activity</h4>
                <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <input maxLength={60} required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Activity name" className="input-field w-full px-3 py-2 text-sm" />
              <input maxLength={100} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Notes (optional)" className="input-field w-full px-3 py-2 text-sm" />
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button type="button" key={c.value} onClick={() => setCat(c.value)}
                    className={`rounded-md border px-2 py-1 text-xs transition ${cat === c.value ? "border-primary bg-primary-light text-primary" : "border-border bg-card text-foreground hover:border-primary/30"}`}>
                    {c.emoji} {c.value}
                  </button>
                ))}
              </div>
              <button disabled={busy} className="btn-primary w-full px-4 py-2 text-sm">
                Add to board
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
