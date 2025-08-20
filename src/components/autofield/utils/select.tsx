import React from "react";

export type SelectOption = { value: string; label: string };

export function SimpleSelect({
	name,
	label,
	opts,
	value,
	error,
	register,
	onChange,
}: {
	name: string;
	label: string;
	opts: SelectOption[];
	value: string;
	error?: string;
	register: any;
	onChange: (v: string) => void;
}) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			<input type="hidden" {...register(name as any)} />
			<select
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			>
				<option disabled value="">
					Select {label}
				</option>
				{opts.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
			{error && (
				<span className="text-xs text-red-500 dark:text-red-400">{error}</span>
			)}
		</div>
	);
}

export function MultiSelect({
	name,
	label,
	opts,
	value,
	error,
	register,
	onChange,
}: {
	name: string;
	label: string;
	opts: SelectOption[];
	value: string[];
	error?: string;
	register: any;
	onChange: (v: string[]) => void;
}) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			<input type="hidden" {...register(name as any)} />
			<select
				multiple
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				value={value}
				onChange={(e) =>
					onChange(
						Array.from(e.target.selectedOptions).map((o) => String(o.value)),
					)
				}
			>
				{opts.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
			{error && (
				<span className="text-xs text-red-500 dark:text-red-400">{error}</span>
			)}
		</div>
	);
}
