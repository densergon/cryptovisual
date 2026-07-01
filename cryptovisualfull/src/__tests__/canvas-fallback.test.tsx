// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CanvasFallback } from "@/shared/components/CanvasFallback";

afterEach(cleanup);

describe("CanvasFallback", () => {
	it("renders aes-matrix fallback", () => {
		render(<CanvasFallback type="aes-matrix" />);
		expect(screen.getByRole("img")).toBeTruthy();
		expect(screen.getByText("Fallback Mode")).toBeTruthy();
		expect(
			screen.getByLabelText("AES state matrix visualization (CSS fallback)"),
		).toBeTruthy();
	});

	it("renders wire fallback", () => {
		render(<CanvasFallback type="wire" />);
		expect(
			screen.getByLabelText("Network wire visualization (CSS fallback)"),
		).toBeTruthy();
	});

	it("renders keygen fallback", () => {
		render(<CanvasFallback type="keygen" />);
		expect(
			screen.getByLabelText("Key generation visualization (CSS fallback)"),
		).toBeTruthy();
	});

	it("shows retry button when onRetry provided", () => {
		render(<CanvasFallback type="aes-matrix" onRetry={() => {}} />);
		const btn = screen.getByText("Retry WebGL");
		expect(btn).toBeTruthy();
		expect(btn.tagName).toBe("BUTTON");
	});

	it("hides retry button without onRetry", () => {
		render(<CanvasFallback type="aes-matrix" />);
		expect(screen.queryByText("Retry WebGL")).toBeNull();
	});
});
