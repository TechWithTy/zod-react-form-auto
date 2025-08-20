"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";

export function BooleanField({
	name,
	label,
	error,
	form,
}: {
	name: string;
	label: string;
	error?: string;
	form: UseFormReturn<any>;
}) {
	const { register } = form;
	return (
		<label className="flex items-center justify-between gap-3">
			<span className="text-sm text-muted-foreground">{label}</span>
			<input
				className="h-4 w-4 accent-primary"
				type="checkbox"
				{...register(name as any)}
			/>
			{error && (
				<span className="text-xs text-red-500 dark:text-red-400">{error}</span>
			)}
		</label>
	);
}
