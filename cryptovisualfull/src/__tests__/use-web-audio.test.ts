// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWebAudio } from "@/shared/hooks/useWebAudio";

const mockUseReducedMotion = vi.fn();
vi.mock("@/shared/hooks/useReducedMotion", () => ({
	useReducedMotion: () => mockUseReducedMotion(),
}));

afterEach(cleanup);

beforeEach(() => {
	mockUseReducedMotion.mockReturnValue(false);
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation(() => ({
			matches: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		})),
	});
});

function makeMockNode() {
	return {
		frequency: {
			setValueAtTime: vi.fn(),
			exponentialRampToValueAtTime: vi.fn(),
		},
		connect: vi.fn(() => makeMockNode()),
		start: vi.fn(),
		stop: vi.fn(),
		gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
	};
}

function runOscGainTest(tone: "packet_arrival" | "click" | "complete") {
	const createOsc = vi.fn(makeMockNode);
	const createGain = vi.fn(makeMockNode);
	function MockCtx(this: any) {
		this.state = "running";
		this.currentTime = 0;
		this.destination = {};
		this.resume = vi.fn();
		this.createOscillator = createOsc;
		this.createGain = createGain;
	}
	vi.stubGlobal("AudioContext", MockCtx);

	const { result } = renderHook(() => useWebAudio());
	result.current.playTone(tone);
	expect(createOsc).toHaveBeenCalledOnce();
	expect(createGain).toHaveBeenCalledOnce();
}

describe("useWebAudio", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns playTone function", () => {
		const { result } = renderHook(() => useWebAudio());
		expect(typeof result.current.playTone).toBe("function");
	});

	it("creates AudioContext when not reduced", () => {
		const stub = vi.fn().mockReturnValue({
			state: "running",
			currentTime: 0,
			destination: {},
			resume: vi.fn(),
			createOscillator: vi.fn(makeMockNode),
			createGain: vi.fn(makeMockNode),
		});
		vi.stubGlobal("AudioContext", stub);
		const { result } = renderHook(() => useWebAudio());
		result.current.playTone("click");
		expect(stub).toHaveBeenCalledOnce();
	});

	it("does not create AudioContext when reduced motion", () => {
		mockUseReducedMotion.mockReturnValue(true);
		const fn = vi.fn();
		vi.stubGlobal("AudioContext", fn);
		const { result } = renderHook(() => useWebAudio());
		result.current.playTone("click");
		expect(fn).not.toHaveBeenCalled();
	});

	it("calls createOscillator and createGain for packet_arrival", () =>
		runOscGainTest("packet_arrival"));

	it("calls createOscillator and createGain for click", () =>
		runOscGainTest("click"));

	it("calls createOscillator and createGain for complete", () =>
		runOscGainTest("complete"));

	it("handles AudioContext constructor throwing", () => {
		vi.stubGlobal(
			"AudioContext",
			vi.fn(() => {
				throw new Error("no audio");
			}),
		);
		const { result } = renderHook(() => useWebAudio());
		expect(() => result.current.playTone("click")).not.toThrow();
	});

	it("resumes suspended AudioContext", () => {
		const resume = vi.fn();
		function SuspendedCtx(this: any) {
			this.state = "suspended";
			this.currentTime = 0;
			this.destination = {};
			this.resume = resume;
			this.createOscillator = vi.fn(makeMockNode);
			this.createGain = vi.fn(makeMockNode);
		}
		vi.stubGlobal("AudioContext", SuspendedCtx);

		const { result } = renderHook(() => useWebAudio());
		result.current.playTone("click");
		expect(resume).toHaveBeenCalledOnce();
	});
});
