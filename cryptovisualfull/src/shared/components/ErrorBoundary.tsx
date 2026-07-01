import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onRetry?: () => void;
	name?: string;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error(
			`ErrorBoundary${this.props.name ? ` [${this.props.name}]` : ""} caught:`,
			error,
			errorInfo,
		);
		const announcer = document.getElementById("accessibility-announcer");
		if (announcer) {
			announcer.textContent = `Error in ${this.props.name ?? "section"}: ${error.message}. Please try again.`;
		}
	}

	private handleRetry = () => {
		this.setState({ hasError: false, error: null });
		this.props.onRetry?.();
	};

	public render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div
					className="flex flex-col items-center justify-center p-6 text-center"
					role="alert"
					aria-live="assertive"
				>
					<h2 className="text-xl font-bold text-white mb-2">
						Something went wrong
					</h2>
					<p className="text-surface-400 mb-1">
						{this.props.name
							? `Error in ${this.props.name}`
							: "A technical error occurred in this section."}
					</p>
					{this.state.error && (
						<p className="text-xs text-surface-500 mb-4 font-mono max-w-md truncate">
							{this.state.error.message}
						</p>
					)}
					<div className="flex items-center gap-3">
						<button
							onClick={this.handleRetry}
							className="px-4 py-2 rounded-lg bg-surface-600 text-white hover:bg-surface-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							Try Again
						</button>
						<a
							href="/"
							className="px-4 py-2 rounded-lg bg-surface-700 text-surface-300 hover:text-white hover:bg-surface-600 transition-colors text-sm"
						>
							Go Home
						</a>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
