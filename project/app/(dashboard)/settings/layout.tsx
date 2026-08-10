import SettingsNav from "./settings-nav";

export default async function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="w-full max-w-5xl">
			<div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start mt-10">
				<SettingsNav />
				{children}
			</div>
		</div>
	);
}
