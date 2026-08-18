export default function StatCard({
	label,
	value,
	sublabel,
}: {
	label: string;
	value: string | number;
	sublabel?: string;
}) {
	return (
		<div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-1">
			<p className="text-sm font-medium text-muted-foreground">{label}</p>
			<p className="text-3xl font-bold text-foreground">{value}</p>
			{sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
		</div>
	);
}
