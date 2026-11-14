import { useState } from "react";
import { useStore } from "../lib/store";
import { bankNumber, getItem, topicShort, wrongKeys } from "../lib/quiz";
import { Button, Card, Chip, EmptyState, Icon, IconButton, PageHeader, Segmented } from "../components/ui";
import { StartSheet, type PracticeRequest } from "../components/StartSheet";
import type { Go } from "../types";

type Tab = "bookmarks" | "wrong";

export default function Saved({ go }: { go: Go }) {
  const { state, toggleBookmark } = useStore();
  const [tab, setTab] = useState<Tab>("bookmarks");
  const [request, setRequest] = useState<PracticeRequest | null>(null);

  const bookmarkKeys = state.bookmarks.filter((k) => getItem(k, state.custom));
  const wrong = wrongKeys(state.latest, state.custom);
  const keys = tab === "bookmarks" ? bookmarkKeys : wrong;

  const startPractice = () =>
    setRequest(
      tab === "bookmarks"
        ? { mode: "saved", title: "Bookmarks", topic: null, pool: bookmarkKeys }
        : { mode: "wrong", title: "Wrong-Answer Practice", topic: null, pool: wrong },
    );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your review set"
        title="Saved & review"
        subtitle="Bookmarked questions and questions your latest answer got wrong. Practise them in focused sessions."
        action={
          keys.length > 0 ? (
            <Button onClick={startPractice}>
              Practise ({keys.length})
            </Button>
          ) : undefined
        }
      />

      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: "bookmarks", label: `Bookmarks · ${bookmarkKeys.length}`, icon: "bookmark" },
          { value: "wrong", label: `Wrong answers · ${wrong.length}`, icon: "xcircle" },
        ]}
      />

      {keys.length === 0 ? (
        <EmptyState
          icon={tab === "bookmarks" ? "bookmark" : "target"}
          title={tab === "bookmarks" ? "No bookmarks yet" : "No wrong answers"}
          text={
            tab === "bookmarks"
              ? "Tap the bookmark icon on any question during a session to save it here."
              : "Questions you answer incorrectly will collect here for focused review."
          }
        />
      ) : (
        <ul className="space-y-3">
          {keys.map((k) => {
            const item = getItem(k, state.custom);
            if (!item) return null;
            const num = bankNumber(k);
            const bookmarked = state.bookmarks.includes(k);
            return (
              <li key={k}>
                <Card className="flex items-start gap-4 p-4 sm:p-5">
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip tone="slate">{num !== null ? `Q${num}` : "My MCQ"}</Chip>
                      <Chip tone={item.custom ? "violet" : "sky"}>{topicShort(item.topic)}</Chip>
                    </div>
                    <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-slate-800 dark:text-slate-100">{item.text}</p>
                  </div>
                  <IconButton
                    label={bookmarked ? "Remove bookmark" : "Bookmark question"}
                    onClick={() => toggleBookmark(k)}
                    className={bookmarked ? "text-amber-500 dark:text-amber-300" : undefined}
                  >
                    <Icon name="bookmark" className={bookmarked ? "fill-current" : undefined} />
                  </IconButton>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <StartSheet request={request} onClose={() => setRequest(null)} go={go} />
    </div>
  );
}
