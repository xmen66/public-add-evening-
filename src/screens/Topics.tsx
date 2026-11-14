import { useState } from "react";
import { useStore } from "../lib/store";
import { keysForTopic, progressFor } from "../lib/quiz";
import { TOPICS } from "../data/topics";
import { Button, Card, Icon, PageHeader, ProgressBar } from "../components/ui";
import { StartSheet, type PracticeRequest } from "../components/StartSheet";
import type { Go } from "../types";

export default function Topics({ go }: { go: Go }) {
  const { state } = useStore();
  const [request, setRequest] = useState<PracticeRequest | null>(null);

  return (
    <div>
      <PageHeader
        eyebrow="Practice by theme"
        title="Topic Practice"
        subtitle="Pick a section of the question bank and practise it on its own. Progress and accuracy update after every session."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {TOPICS.map((t, idx) => {
          const keys = keysForTopic(t.id);
          const p = progressFor(state.latest, keys);
          return (
            <Card key={t.id} interactive className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-base font-extrabold text-white shadow-lg ${t.accent}`}>
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-balance font-bold leading-snug text-slate-900 dark:text-white">{t.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Q{t.range[0]}–Q{t.range[1]} · {keys.length} questions
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>
                    {p.attempted}/{p.total} attempted
                  </span>
                  <span className={p.attempted ? "text-slate-700 dark:text-slate-200" : ""}>
                    {p.attempted ? `${p.accuracy}% accurate` : "Not started"}
                  </span>
                </div>
                <ProgressBar value={p.attempted} max={p.total} barClassName={`bg-gradient-to-r ${t.accent}`} />
              </div>

              <Button
                variant="soft"
                block
                onClick={() => setRequest({ mode: "topic", title: t.name, topic: t.id, pool: keys })}
              >
                Practise this topic
                <Icon name="arrowRight" className="h-4 w-4" />
              </Button>
            </Card>
          );
        })}

        {state.custom.length > 0 && (
          <Card interactive className="flex flex-col gap-5 md:col-span-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-lg">
                <Icon name="pen" className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white">My MCQs</h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{state.custom.length} personal questions</p>
              </div>
            </div>
            <Button
              variant="soft"
              block
              onClick={() =>
                setRequest({
                  mode: "custom",
                  title: "My MCQs",
                  topic: null,
                  pool: state.custom.map((c) => c.key),
                })
              }
            >
              Practise my MCQs
              <Icon name="arrowRight" className="h-4 w-4" />
            </Button>
          </Card>
        )}
      </div>

      <StartSheet request={request} onClose={() => setRequest(null)} go={go} />
    </div>
  );
}
