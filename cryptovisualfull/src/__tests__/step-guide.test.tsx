// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("motion/react", () => ({
	motion: {
		div: ({
			children,
			...props
		}: ComponentProps<"div"> & {
			initial?: unknown;
			animate?: unknown;
			exit?: unknown;
			transition?: unknown;
		}) => <div {...props}>{children}</div>,
	},
	AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

import { StepGuide } from "@/shared/components/StepGuide";

afterEach(cleanup);

const SECTIONS = [
	{ title: "How it works", body: "Step explanation here." },
	{ title: "Why it matters", body: "Security rationale here." },
];

describe("StepGuide", () => {
	it("renders info button", () => {
		render(<StepGuide sections={SECTIONS} />);
		const btn = screen.getByRole("button", { name: /learn about this step/i });
		expect(btn).toBeTruthy();
	});

	it("opens modal on info button click", () => {
		render(<StepGuide sections={SECTIONS} />);
		fireEvent.click(
			screen.getByRole("button", { name: /learn about this step/i }),
		);
		expect(screen.getByRole("dialog", { name: /step guide/i })).toBeTruthy();
	});

	it("renders all section titles and bodies in modal", () => {
		render(<StepGuide sections={SECTIONS} />);
		fireEvent.click(
			screen.getByRole("button", { name: /learn about this step/i }),
		);
		for (const s of SECTIONS) {
			expect(screen.getByText(s.title)).toBeTruthy();
			expect(screen.getByText(s.body)).toBeTruthy();
		}
	});

	it("closes modal on close button click", () => {
		render(<StepGuide sections={SECTIONS} />);
		fireEvent.click(
			screen.getByRole("button", { name: /learn about this step/i }),
		);
		expect(screen.queryByRole("dialog")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: /close guide/i }));
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("closes modal on backdrop click", () => {
		render(<StepGuide sections={SECTIONS} />);
		fireEvent.click(
			screen.getByRole("button", { name: /learn about this step/i }),
		);
		expect(screen.queryByRole("dialog")).toBeTruthy();
		const backdrop = document.querySelector(".fixed.inset-0");
		expect(backdrop).not.toBeNull();
		if (backdrop) fireEvent.click(backdrop);
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("shows correct number of sections", () => {
		render(<StepGuide sections={SECTIONS} />);
		fireEvent.click(
			screen.getByRole("button", { name: /learn about this step/i }),
		);
		const headings = screen.getAllByRole("heading");
		expect(headings.length).toBe(SECTIONS.length);
	});
});
