"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";

export function BooleanSelectField({
	name,
	label,
	error,
	opts,
	form,
}: {
	name: string;
	label: string;
	error?: string;
	opts: Array<{ value: string; label: string }>;
	form: UseFormReturn<any>;
}) {
	const { register, setValue, watch } = form;
	const current = watch(name as any) as any as boolean | undefined;
	const value = typeof current === "boolean" ? String(current) : "";
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			<input type="hidden" {...register(name as any)} />
			<select
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				value={value}
				onChange={(e) => {
					const v = e.target.value;
					const boolVal =
						v === "true" ? true : v === "false" ? false : undefined;
					setValue(name as any, boolVal as any, {
						shouldValidate: true,
						shouldDirty: true,
					});
				}}
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
