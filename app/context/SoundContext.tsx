"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

type SoundType = "hover" | "click";

interface SoundContextType {
	playSound: (type: SoundType) => void;
	isMuted: boolean;
	toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const SOUND_URLS = {
	hover: "/sounds/hover.mp3",
	click: "/sounds/click.mp3",
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
	const audioContextRef = useRef<AudioContext | null>(null);
	const buffersRef = useRef<Record<SoundType, AudioBuffer | null>>({ hover: null, click: null });
	const [isMuted, setIsMuted] = useState(false);

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
			window.addEventListener("keydown", resumeAudio);
			window.addEventListener("touchstart", resumeAudio);

			const loadBuffer = async (url: string): Promise<AudioBuffer> => {
				const response = await fetch(url);
				const arrayBuffer = await response.arrayBuffer();
				const audioBuffer = await context.decodeAudioData(arrayBuffer);
				return trimSilence(audioBuffer, context);
			};

			try {
				const [hoverBuffer, clickBuffer] = await Promise.all([loadBuffer(SOUND_URLS.hover), loadBuffer(SOUND_URLS.click)]);
				buffersRef.current = {
					hover: hoverBuffer,
					click: clickBuffer,
				};
			} catch (error) {
				console.error("Failed to load sounds:", error);
			}

			// Cleanup listeners
			return () => {
				window.removeEventListener("click", resumeAudio);
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
			return; // Skip this playback if context was suspended to avoid "pop" on resume
		}

		const source = context.createBufferSource();
		source.buffer = buffersRef.current[type];

		// Pitch variation: +/- 50 cents
		const detuneAmount = Math.random() * 100 - 50;
		source.detune.value = detuneAmount;

		const gainNode = context.createGain();

		// Reduce volume significantly and add envelope to avoid pops
		const volume = type === "hover" ? 0.4 : 0.45;

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

	const toggleMute = () => setIsMuted((prev) => !prev);

	return <SoundContext.Provider value={{ playSound, isMuted, toggleMute }}>{children}</SoundContext.Provider>;
}

export function useSound() {
	const context = useContext(SoundContext);
	if (context === undefined) {
		throw new Error("useSound must be used within a SoundProvider");
	}
	return context;
}
