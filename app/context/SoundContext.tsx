"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

type SoundType = "hover" | "click" | "unlock" | "tick";

interface SoundContextType {
	playSound: (type: SoundType) => void;
	isMuted: boolean;
	toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const SOUND_URLS = {
	hover: "/sounds/hover.mp3",
	click: "/sounds/click.mp3",
	unlock: "/sounds/unlock.mp3",
	tick: "/sounds/tick.mp3",
};

const SOUND_MUTED_KEY = "sound-muted";

export function SoundProvider({ children }: { children: React.ReactNode }) {
	const audioContextRef = useRef<AudioContext | null>(null);
	const buffersRef = useRef<Record<SoundType, AudioBuffer | null>>({ hover: null, click: null, unlock: null, tick: null });
	const [isMuted, setIsMuted] = useState(() => {
		if (typeof window === "undefined") return false;
		return localStorage.getItem(SOUND_MUTED_KEY) === "true";
	});

	useEffect(() => {
		const initAudio = async () => {
			const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
			if (!AudioContextClass) return;

			const context = new AudioContextClass();
			audioContextRef.current = context;

			// Handle autoplay policy
			const resumeAudio = () => {
				if (context.state === "suspended") {
					context.resume();
				}
			};

			// Attach listeners to resume context on first interaction
			window.addEventListener("click", resumeAudio);
			window.addEventListener("mousedown", resumeAudio);
			window.addEventListener("keydown", resumeAudio);
			window.addEventListener("touchstart", resumeAudio);

			const loadBuffer = async (url: string): Promise<AudioBuffer> => {
				const response = await fetch(url);
				const arrayBuffer = await response.arrayBuffer();
				const audioBuffer = await context.decodeAudioData(arrayBuffer);
				return trimSilence(audioBuffer, context);
			};

			try {
				const [hoverBuffer, clickBuffer, unlockBuffer, tickBuffer] = await Promise.all([
					loadBuffer(SOUND_URLS.hover),
					loadBuffer(SOUND_URLS.click),
					loadBuffer(SOUND_URLS.unlock),
					loadBuffer(SOUND_URLS.tick),
				]);
				buffersRef.current = {
					hover: hoverBuffer,
					click: clickBuffer,
					unlock: unlockBuffer,
					tick: tickBuffer,
				};
			} catch (error) {
				console.error("Failed to load sounds:", error);
			}

			// Cleanup listeners
			return () => {
				window.removeEventListener("click", resumeAudio);
				window.removeEventListener("mousedown", resumeAudio);
				window.removeEventListener("keydown", resumeAudio);
				window.removeEventListener("touchstart", resumeAudio);
				context.close();
			};
		};

		const cleanup = initAudio();
		return () => {
			cleanup.then((fn) => fn && fn());
		};
	}, []);

	const trimSilence = (buffer: AudioBuffer, context: AudioContext): AudioBuffer => {
		const data = buffer.getChannelData(0);
		// Increase threshold slightly to catch more noise floor if necessary
		const threshold = 0.01;
		let start = 0;
		let end = data.length;

		// Find start
		for (let i = 0; i < data.length; i++) {
			if (Math.abs(data[i]) > threshold) {
				start = i;
				break;
			}
		}

		// Find end
		for (let i = data.length - 1; i >= 0; i--) {
			if (Math.abs(data[i]) > threshold) {
				end = i;
				break;
			}
		}

		if (end <= start) return buffer;

		const length = end - start;
		const newBuffer = context.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);

		for (let i = 0; i < buffer.numberOfChannels; i++) {
			newBuffer.getChannelData(i).set(buffer.getChannelData(i).subarray(start, end));
		}

		return newBuffer;
	};

	const playSound = (type: SoundType) => {
		if (isMuted || !audioContextRef.current || !buffersRef.current[type]) return;

		const context = audioContextRef.current;

		// Try to resume if suspended (though the global listener should catch this)
		if (context.state === "suspended") {
			context.resume().catch(() => {});
		}

		const source = context.createBufferSource();
		source.buffer = buffersRef.current[type];

		// Pitch variation: +/- 50 cents
		const detuneAmount = Math.random() * 100 - 50;
		source.detune.value = detuneAmount;

		const gainNode = context.createGain();

		// Reduce volume significantly and add envelope to avoid pops
		let volume = type === "hover" ? 0.4 : 0.45;
		if (type === "tick") volume = 0.8;

		// Start at 0
		gainNode.gain.setValueAtTime(0, context.currentTime);
		// Fast attack (10ms) to target volume
		gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.01);
		// Decay if needed, but for short sounds just letting it play is usually fine.
		// For longer sounds, we might want to release, but these are short SFX.

		source.connect(gainNode);
		gainNode.connect(context.destination);
		source.start(0);
	};

	const toggleMute = () => {
		setIsMuted((prev) => {
			const next = !prev;
			localStorage.setItem(SOUND_MUTED_KEY, String(next));
			return next;
		});
	};

	return <SoundContext.Provider value={{ playSound, isMuted, toggleMute }}>{children}</SoundContext.Provider>;
}

export function useSound() {
	const context = useContext(SoundContext);
	if (context === undefined) {
		throw new Error("useSound must be used within a SoundProvider");
	}
	return context;
}
