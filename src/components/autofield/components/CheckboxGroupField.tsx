"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";

export function CheckboxGroupField({
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
	const { watch, setValue } = form;
	const current = watch(name as any) as string[] | undefined;
	const values = Array.isArray(current) ? current : [];

	const toggle = (val: string) => {
		const next = values.includes(val)
			? values.filter((v) => v !== val)
			: [...values, val];
		setValue(name as any, next as any, {
			shouldValidate: true,
			shouldDirty: true,
			shouldTouch: true,
		});
	};

	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{opts.map((o) => {
					const checked = values.includes(o.value);
					return (
						<label key={o.value} className="flex items-center gap-2">
							<input
								type="checkbox"
								className="h-4 w-4 accent-primary"
								checked={checked}
								onChange={() => toggle(o.value)}
							/>
							<span className="text-sm text-foreground">{o.label}</span>
						</label>
					);
				})}
			</div>
			{error && (
				<span className="text-xs text-red-500 dark:text-red-400">{error}</span>
			)}
		</div>
	);
}
