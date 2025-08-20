"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";

export function TextareaField({
	name,
	label,
	error,
	rows,
	placeholder,
	form,
}: {
	name: string;
	label: string;
	error?: string;
	rows?: number;
	placeholder?: string;
	form: UseFormReturn<any>;
}) {
	const { register } = form;
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			<textarea
				className="min-h-24 max-h-[60vh] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				rows={rows ?? 5}
				placeholder={placeholder}
				{...register(name as any)}
			/>
			{error && (
				<span className="text-xs text-red-500 dark:text-red-400">{error}</span>
			)}
		</div>
	);
}

export function CollapsibleTextareaField(
	props: Parameters<typeof TextareaField>[0],
) {
	const { label } = props;
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			<details className="rounded-md border border-border open:bg-card">
				<summary className="cursor-pointer select-none bg-muted px-2 py-1 text-xs text-muted-foreground">{`Edit ${label}`}</summary>
				<div className="p-2">
					<TextareaField {...props} />
				</div>
			</details>
		</div>
	);
}
