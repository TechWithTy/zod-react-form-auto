"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";

export function TextField({
	name,
	label,
	error,
	placeholder,
	pattern,
	type = "text",
	form,
}: {
	name: string;
	label: string;
	error?: string;
	placeholder?: string;
	pattern?: string;
	type?: string;
	form: UseFormReturn<any>;
}) {
	const { register } = form;
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			<input
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				placeholder={placeholder}
				pattern={pattern}
				type={type}
				{...register(name as any)}
			/>
			{error && (
				<span className="text-xs text-red-500 dark:text-red-400">{error}</span>
			)}
		</div>
	);
}
