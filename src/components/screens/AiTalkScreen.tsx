import { useState, useEffect, type FC } from 'react';
import { Mic, MicOff, Sparkles, Volume2, LayoutGrid } from 'lucide-react';

interface AiTalkScreenProps {
  onOpenQuickMenu?: () => void;
}

export const AiTalkScreen: FC<AiTalkScreenProps> = ({ onOpenQuickMenu }) => {
  const [speechState, setSpeechState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [activeSpeechText, setActiveSpeechText] = useState<string>('');

  const sampleConversations = [
    "I'm feeling a bit overwhelmed with college tasks lately.",
    "Today was actually quite nice, I managed to finish my project!",
    "I'm having trouble sleeping because I keep overthinking.",
    "Can you suggest a simple mindfulness exercise for me?",
  ];

  const hyoResponses = [
    "I hear you. Academic pressure can feel so heavy. Let's take it one small step at a time, okay? You don't have to carry it all at once.",
    "That is wonderful to hear! Acknowledging these moments of success helps build resilience. I'm proud of you!",
    "It's completely normal when your mind refuses to slow down. Would you like to try 3 gentle deep breaths together right now?",
    "A quick technique is the 5-4-3-2-1 grounding method, or simply stepping outside for fresh air. You're doing the best you can.",
  ];

  const handleMicToggle = () => {
    if (speechState === 'idle') {
      setSpeechState('listening');
      const randomPrompt = sampleConversations[Math.floor(Math.random() * sampleConversations.length)];
      setActiveSpeechText(`"${randomPrompt}"`);

      // Simulate thinking then speaking
      setTimeout(() => {
        setSpeechState('thinking');
        setTimeout(() => {
          setSpeechState('speaking');
          const randomReply = hyoResponses[Math.floor(Math.random() * hyoResponses.length)];
          setActiveSpeechText(randomReply);
        }, 1200);
      }, 2500);
    } else {
      setSpeechState('idle');
      setActiveSpeechText('');
    }
  };

  useEffect(() => {
    if (speechState === 'speaking') {
      const timer = setTimeout(() => {
        setSpeechState('idle');
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [speechState]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between px-4 pb-28 pt-1 overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 size-72 rounded-full bg-blue-300/30 blur-[36px] pointer-events-none" />
      <div className="absolute top-64 -left-16 size-60 rounded-full bg-indigo-200/35 blur-[28px] pointer-events-none" />
      <div className="absolute bottom-24 -right-16 size-56 rounded-full bg-sky-200/40 blur-[28px] pointer-events-none" />

      {/* Top Floating Status Pill & Context Controls */}
      <div className="w-full flex items-center justify-between px-2 pt-1 z-10">
        <div className="w-10" /> {/* Spacer */}

        {/* Presence Badge */}
        <div className="backdrop-blur-md bg-white/80 border border-white/70 h-10 px-4 rounded-full shadow-[0px_4px_16px_0px_rgba(74,144,226,0.12)] flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2.5 bg-[#005ab6]" />
          </span>
          <span className="font-['Inter'] font-semibold text-[14px] text-[#005ab6]">
            Aisa is here
          </span>
        </div>

        {/* Action button */}
        <button
          onClick={onOpenQuickMenu}
          className="size-10 rounded-full backdrop-blur-md bg-white/80 border border-white/70 shadow-[0px_4px_16px_0px_rgba(74,144,226,0.12)] flex items-center justify-center text-slate-700 hover:text-[#005ab6] active:scale-95 transition-all"
          title="Menu"
          aria-label="Menu"
        >
          <LayoutGrid className="size-4.5" />
        </button>
      </div>

      {/* Dynamic Emotional Header Section */}
      <div className="w-full text-center mt-3 z-10 flex flex-col items-center">
        <h1 className="font-['Inter'] font-bold text-[24px] sm:text-[26px] tracking-tight leading-tight text-black">
          Hey there,
        </h1>
        <h2 className="font-['Inter'] font-bold text-[24px] sm:text-[26px] tracking-tight leading-tight text-[#005ab6]">
          how are you today?
        </h2>
        <p className="font-['Inter'] font-medium text-[14px] text-[#475569] max-w-[280px] mt-2 leading-relaxed">
          I'm here to listen, support, and figure things out with you.
        </p>

        {/* Live speech feedback pill when active */}
        {speechState !== 'idle' && (
          <div className="mt-3 px-4 py-2.5 backdrop-blur-md bg-white/90 border border-blue-200/80 rounded-2xl shadow-md max-w-sm animate-fade-in text-slate-800 text-sm">
            {speechState === 'listening' && (
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
                Listening to you...
              </div>
            )}
            {speechState === 'thinking' && (
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Sparkles className="size-4 text-blue-500 animate-spin" />
                Hyo is thinking...
              </div>
            )}
            {speechState === 'speaking' && (
              <div className="flex items-start gap-2.5 text-slate-700 text-left">
                <Volume2 className="size-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[13.5px] leading-snug">{activeSpeechText}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive 3D Mascot Character Stage */}
      <div className="relative my-auto flex flex-col items-center justify-center z-10 py-4">
        {/* Floor Shadow */}
        <div className="absolute bottom-2 w-48 h-8 rounded-full bg-blue-900/10 blur-[12px] scale-x-90" />

        <div className="relative size-60 sm:size-64 flex items-center justify-center">
          <img
            src="/assets/mascot-talk.png"
            alt="Aisa Mascot"
            className={`w-full h-full object-contain transition-transform duration-500 ${
              speechState === 'speaking'
                ? 'scale-105 animate-bounce'
                : speechState === 'listening'
                ? 'scale-102'
                : 'hover:scale-105'
            }`}
          />
        </div>
      </div>

      {/* Primary Action Section (CTA) */}
      <div className="w-full flex flex-col items-center z-10">
        {/* Pulsing Mic Button */}
        <div className="relative flex items-center justify-center mb-3">
          {speechState === 'listening' && (
            <div className="absolute size-32 rounded-full bg-blue-400/30 animate-ping pointer-events-none" />
          )}

          <button
            onClick={handleMicToggle}
            className={`size-24 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-[0px_12px_24px_rgba(0,90,182,0.35)] active:scale-95 ${
              speechState === 'listening'
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 ring-4 ring-rose-200'
                : 'bg-gradient-to-r from-[#005ab6] to-[#1672df] hover:from-[#004a96] hover:to-[#1361bd]'
            }`}
            title={speechState === 'listening' ? 'Stop speaking' : 'Tap to speak'}
            aria-label="Voice input toggle"
          >
            {speechState === 'listening' ? (
              <MicOff className="size-10" />
            ) : (
              <Mic className="size-10" />
            )}
          </button>
        </div>

        <span className="font-['Inter'] font-semibold text-[17px] text-[#475569] mb-1.5">
          {speechState === 'listening'
            ? 'Listening... tap to pause'
            : speechState === 'speaking'
            ? 'Hyo is responding...'
            : 'Tap to speak'}
        </span>

        {/* Reassurance Microcopy */}
        <p className="font-['Inter'] font-medium text-[13px] text-[#475569] text-center max-w-[280px] leading-relaxed">
          You can share anything. There's no right or wrong way to start.
        </p>
      </div>
    </div>
  );
};
