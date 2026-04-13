import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { startLiveSession } from '../services/gemini';
import { cn } from '../lib/utils';

export function VoiceAgent() {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlaying = useRef(false);

  const playNextInQueue = async () => {
    if (audioQueue.current.length === 0 || isPlaying.current || isMuted) return;
    
    isPlaying.current = true;
    const pcmData = audioQueue.current.shift()!;
    
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    
    const buffer = audioContextRef.current.createBuffer(1, pcmData.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 32768;
    }
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      isPlaying.current = false;
      playNextInQueue();
    };
    source.start();
  };

  const toggleSession = async () => {
    if (isActive) {
      sessionRef.current?.close();
      streamRef.current?.getTracks().forEach(track => track.stop());
      processorRef.current?.disconnect();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
      setIsActive(false);
      return;
    }

    setIsConnecting(true);
    try {
      const session = await startLiveSession(
        "You are a voice-enabled LANCE: success engine. You can hear the user and respond in real-time. Be concise, helpful, and professional.",
        (base64Data) => {
          const binary = atob(base64Data);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const pcm16 = new Int16Array(bytes.buffer);
          audioQueue.current.push(pcm16);
          playNextInQueue();
        }
      );
      sessionRef.current = session;

      // Setup audio input
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
        session.sendRealtimeInput({
          audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      
      setIsActive(true);
    } catch (error) {
      console.error(error);
      alert("Failed to connect to voice agent. Please check your microphone permissions.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[600px] bg-[#141414] rounded-3xl border border-white/5 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.1, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 1,
                  }}
                  className="absolute w-64 h-64 border border-cyan-500/30 rounded-full"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-4xl font-serif font-extrabold tracking-tight">Voice Conversation</h3>
          <p className="text-gray-400 max-w-xs mx-auto font-sans">
            {isActive 
              ? "I'm listening. Ask me anything about your freelance business." 
              : "Connect to start a real-time voice conversation with your career agent."}
          </p>
        </div>

        <div className="relative">
          <motion.button
            onClick={toggleSession}
            disabled={isConnecting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 relative z-20",
              isActive 
                ? "bg-red-500 shadow-2xl shadow-red-500/40" 
                : "bg-cyan-600 shadow-2xl shadow-cyan-600/40"
            )}
          >
            {isConnecting ? (
              <Loader2 className="w-12 h-12 animate-spin" />
            ) : isActive ? (
              <MicOff className="w-12 h-12" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
          </motion.button>
          
          {isActive && (
            <div className="absolute -inset-4 bg-cyan-500/20 rounded-full animate-ping pointer-events-none" />
          )}
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-gray-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: isActive ? [8, 24, 8] : 8,
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
                className="w-1.5 bg-cyan-500 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
        <span>Model: Gemini 3.1 Flash Lite</span>
        <span className={cn(isActive ? "text-emerald-400" : "text-gray-500")}>
          {isActive ? "Connected" : "Disconnected"}
        </span>
      </div>
    </div>
  );
}
