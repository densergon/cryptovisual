// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { Component, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";

afterEach(cleanup);

function ErrorFallback() {
	return <div data-testid="custom">Custom Error</div>;
}

class Thrower extends Component<{ message?: string }> {
	render(): ReactNode {
		throw new Error(this.props.message ?? "Test error");
	}
}

describe("ErrorBoundary", () => {
	it("renders children when no error", () => {
		render(
			<ErrorBoundary>
				<div>Hello</div>
			</ErrorBoundary>,
		);
		expect(screen.getByText("Hello")).toBeTruthy();
	});

	it("catches errors and shows fallback UI", () => {
		const onRetry = vi.fn();
		render(
			<ErrorBoundary name="TestSection" onRetry={onRetry}>
				<Thrower message="Test error" />
			</ErrorBoundary>,
		);
		expect(screen.getByText("Something went wrong")).toBeTruthy();
		expect(screen.getByText("Error in TestSection")).toBeTruthy();
		expect(screen.getByText("Test error")).toBeTruthy();
		expect(screen.getByText("Try Again")).toBeTruthy();
		const btn = screen.getByText("Try Again");
		expect(btn.tagName).toBe("BUTTON");
	});

	it("uses custom fallback when provided", () => {
		render(
			<ErrorBoundary fallback={<ErrorFallback />}>
				<Thrower />
			</ErrorBoundary>,
		);
		expect(screen.getByTestId("custom")).toBeTruthy();
		expect(screen.queryByText("Something went wrong")).toBeNull();
	});

	it('has role="alert" on error', () => {
		render(
			<ErrorBoundary>
				<Thrower />
			</ErrorBoundary>,
		);
		expect(screen.getByRole("alert")).toBeTruthy();
	});
});
