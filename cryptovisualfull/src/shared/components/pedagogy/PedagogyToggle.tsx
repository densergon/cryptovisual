import { GraduationCap } from "lucide-react";
import { usePedagogyMode } from "../../providers/PedagogyModeProvider";

export function PedagogyToggle() {
	const { isPedagogyMode, togglePedagogyMode } = usePedagogyMode();

	return (
		<button
			type="button"
			onClick={togglePedagogyMode}
			className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
				isPedagogyMode
					? "bg-hybrid-600 text-white"
					: "bg-surface-700 text-surface-400 hover:bg-surface-600 hover:text-white"
			}`}
			aria-label={
				isPedagogyMode ? "Disable pedagogy mode" : "Enable pedagogy mode"
			}
		>
			<GraduationCap size={14} />
			{isPedagogyMode ? "Pedagogy: ON" : "Learn"}
		</button>
	);
}
