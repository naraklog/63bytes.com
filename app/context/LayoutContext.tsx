"use client";

import React, { createContext, useContext, useRef, useCallback, useEffect } from "react";

type MorphState = {
	enabled: boolean;
	progress: number;
};

type Listener = (state: MorphState) => void;

interface LayoutContextType {
	leftDigitRef: React.MutableRefObject<HTMLSpanElement | null>;
	rightDigitRef: React.MutableRefObject<HTMLSpanElement | null>;
	setMorphEnabled: (enabled: boolean) => void;
	setMorphProgress: (progress: number) => void;
	subscribe: (listener: Listener) => () => void;
	getSnapshot: () => MorphState;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
	const leftDigitRef = useRef<HTMLSpanElement | null>(null);
	const rightDigitRef = useRef<HTMLSpanElement | null>(null);

	// specialized state management for high-frequency updates (animation loop)
	// to avoid re-rendering the whole tree on every scroll frame
	const stateRef = useRef<MorphState>({ enabled: false, progress: 0 });
	const listenersRef = useRef<Set<Listener>>(new Set());

	const notify = useCallback(() => {
		const currentState = stateRef.current;
		listenersRef.current.forEach((listener) => listener(currentState));
	}, []);

	const setMorphEnabled = useCallback(
		(enabled: boolean) => {
			if (stateRef.current.enabled !== enabled) {
				stateRef.current.enabled = enabled;
				notify();
			}
		},
		[notify]
	);

	const setMorphProgress = useCallback(
		(progress: number) => {
			const clamped = Math.max(0, Math.min(1, progress));
			if (stateRef.current.progress !== clamped) {
				stateRef.current.progress = clamped;
				notify();
			}
		},
		[notify]
	);

	const subscribe = useCallback((listener: Listener) => {
		listenersRef.current.add(listener);
		// immediately call with current state
		listener(stateRef.current);
		return () => {
			listenersRef.current.delete(listener);
		};
	}, []);

	const getSnapshot = useCallback(() => stateRef.current, []);

	const value = {
		leftDigitRef,
		rightDigitRef,
		setMorphEnabled,
		setMorphProgress,
		subscribe,
		getSnapshot,
	};

	return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

export const useLayoutContext = () => {
	const context = useContext(LayoutContext);
	if (!context) {
		throw new Error("useLayoutContext must be used within a LayoutProvider");
	}
	return context;
};

