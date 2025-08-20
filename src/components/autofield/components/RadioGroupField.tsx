"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";

export function RadioGroupField({
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
	const current = watch(name as any) as string | undefined;

	const onChange = (val: string) => {
		setValue(name as any, val as any, {
			shouldValidate: true,
			shouldDirty: true,
			shouldTouch: true,
		});
	};

	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{opts.map((o) => (
					<label key={o.value} className="flex items-center gap-2">
						<input
							type="radio"
							className="h-4 w-4 accent-primary"
							checked={current === o.value}
							onChange={() => onChange(o.value)}
						/>
						<span className="text-sm text-foreground">{o.label}</span>
					</label>
				))}
			</div>
			{error && (
				<span className="text-xs text-red-500 dark:text-red-400">{error}</span>
			)}
		</div>
	);
}
