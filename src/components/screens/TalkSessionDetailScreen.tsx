import { useMemo, type FC } from "react";
import { MessageCircle } from "lucide-react";
import type { TalkSession } from "../../services/talkStorage";
import { sessionToJournalEntry } from "../../services/journalInsights";
import type { MoodType, RoadmapItem } from "../../types";
import type { UiMessage } from "../../types/chat";
import { ChatMessageBubble } from "../chat/ChatMessageBubble";
import { DetailJournalScreen } from "./DetailJournalScreen";

interface TalkSessionDetailScreenProps {
  session: TalkSession;
  /** True when this is the conversation currently open on the Talk screen */
  isActive: boolean;
  /** Mood picked on Home, used when the conversation gives no clear mood */
  fallbackMood: MoodType;
  onBack: () => void;
  onTalkToCounselor?: () => void;
  onSelectRoadmapItem?: (item: RoadmapItem) => void;
  /** Opens the Talk tab (only offered for the active session) */
  onContinue?: () => void;
}

/**
 * A saved Talk conversation shown in the regular Journal detail layout
 * (mood, recommendation, roadmap), followed by the read-only transcript.
 */
export const TalkSessionDetailScreen: FC<TalkSessionDetailScreenProps> = ({
  session,
  isActive,
  fallbackMood,
  onBack,
  onTalkToCounselor,
  onSelectRoadmapItem,
  onContinue,
}) => {
  const entry = useMemo(
    () => sessionToJournalEntry(session, fallbackMood),
    [session, fallbackMood],
  );

  const messages = useMemo<UiMessage[]>(
    () =>
      session.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp),
        isError: m.isError,
      })),
    [session.messages],
  );

  return (
    <DetailJournalScreen
      entry={entry}
      onBack={onBack}
      onTalkToCounselor={onTalkToCounselor}
      onSelectRoadmapItem={onSelectRoadmapItem}
    >
      {/* Transcript (read-only) */}
      <section
        aria-label="Your Conversation"
        className="w-full backdrop-blur-md bg-white/60 border-2 border-white/80 rounded-[22px] p-4.5 shadow-[0px_12px_30px_0px_rgba(111,174,226,0.1)] flex flex-col gap-3.5"
      >
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-['Inter'] font-bold text-[16px] text-black tracking-tight">
            Your Conversation
          </h2>
          <span className="font-['Inter'] text-[12px] text-[#475569] shrink-0">
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}
        </div>
      </section>

      {isActive && onContinue && (
        <button
          onClick={onContinue}
          className="self-center h-11 px-5 rounded-full bg-gradient-to-r from-[#005ab6] to-[#1672df] text-white flex items-center gap-2 text-sm font-semibold shadow-[0px_4px_12px_rgba(0,90,182,0.3)] active:scale-95 transition-all"
        >
          <MessageCircle className="size-4" />
          Continue in Talk
        </button>
      )}
    </DetailJournalScreen>
  );
};
