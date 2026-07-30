"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function SearchBar() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [query, setQuery] = useState(searchParams.get("nameSearch") || "");

	const handleSearch = () => {
		const params = new URLSearchParams(searchParams.toString());

		if (query) {
			params.set("nameSearch", query);
		} else {
			params.delete("nameSearch");
		}

		router.push(`/projects?${params.toString()}`);
	};

	return (
		<div className="w-full flex gap-5 items-center">
			<Input
				type="text"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyDown={(e) => e.key === "Enter" && handleSearch()}
				placeholder="Search Title"
				className="bg-card border-foreground/20 py-4"
			/>
			<Button variant="secondary" onClick={handleSearch}>
				<Search size={16} />
				Search
			</Button>
		</div>
	);
}
