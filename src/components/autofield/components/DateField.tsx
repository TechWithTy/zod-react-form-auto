"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Calendar } from "../../../../../../ui/calendar";

export function DateField({
	name,
	label,
	error,
	minDate,
	maxDate,
	withTime,
	numberOfMonths,
	captionLayout,
	fromYear,
	toYear,
	form,
}: {
	name: string;
	label: string;
	error?: string;
	minDate?: Date;
	maxDate?: Date;
	withTime?: boolean;
	numberOfMonths?: number;
	captionLayout?: "label" | "dropdown";
	fromYear?: number;
	toYear?: number;
	form: UseFormReturn<any>;
}) {
	const { register, unregister, getValues, watch, setValue } = form;
	const current = watch(name as any) as any as Date | undefined;

	const [time, setTime] = React.useState<string | undefined>(
		current
			? `${String(current.getHours()).padStart(2, "0")}:${String(current.getMinutes()).padStart(2, "0")}`
			: undefined,
	);

	const applyTime = (base: Date, t: string | undefined) => {
		if (!t) return base;
		const [hh, mm] = t.split(":").map((v) => parseInt(v, 10));
		const copy = new Date(base);
		if (!Number.isNaN(hh)) copy.setHours(hh);
		if (!Number.isNaN(mm)) copy.setMinutes(mm);
		copy.setSeconds(0, 0);
		return copy;
	};

	// Normalize vague Zod error
	const normError = React.useMemo(() => {
		if (!error) return undefined;
		const t = String(error).trim();
		if (t.toLowerCase() === "invalid input") return `${label} is required`;
		return error;
	}, [error, label]);

	// Keep field registered without binding a DOM input that might set a string on clear
	React.useEffect(() => {
		try {
			register(name as any);
		} catch {}
		// Ensure the stored value is Date | undefined
		const v = (getValues() as any)[name];
		if (v != null && !(v instanceof Date)) {
			setValue(name as any, undefined as any, { shouldValidate: true });
		}
		return () => {
			try {
				unregister(name as any);
			} catch {}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [name, register, unregister, setValue]);

	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			{/* Imperatively registered; no hidden input bound to a string value */}
			<div className="rounded-md border border-border p-2">
				<Calendar
					mode="single"
					selected={current}
					numberOfMonths={numberOfMonths}
					captionLayout={captionLayout}
					fromYear={fromYear}
					toYear={toYear}
					disabled={(date) => {
						const d = new Date(
							date.getFullYear(),
							date.getMonth(),
							date.getDate(),
						);
						if (minDate) {
							const m = new Date(
								minDate.getFullYear(),
								minDate.getMonth(),
								minDate.getDate(),
							);
							if (d < m) return true;
						}
						if (maxDate) {
							const M = new Date(
								maxDate.getFullYear(),
								maxDate.getMonth(),
								maxDate.getDate(),
							);
							if (d > M) return true;
						}
						return false;
					}}
					onSelect={(d) =>
						setValue(
							name as any,
							(d ? (withTime ? applyTime(d, time) : d) : undefined) as any,
							{
								shouldValidate: true,
								shouldDirty: true,
								shouldTouch: true,
							},
						)
					}
					initialFocus
				/>
			</div>
			{withTime && (
				<div className="mt-2 flex items-center gap-2">
					<label className="w-24 text-xs text-muted-foreground">Time</label>
					<input
						type="time"
						className="w-full rounded-md border border-border p-1 text-sm"
						value={time ?? ""}
						onChange={(e) => {
							const v = e.target.value;
							setTime(v);
							const cur = watch(name as any) as Date | undefined;
							if (cur) {
								const updated = applyTime(cur, v);
								setValue(name as any, updated as any, {
									shouldValidate: true,
									shouldDirty: true,
									shouldTouch: true,
								});
							}
						}}
					/>
				</div>
			)}
			{normError && (
				<span className="text-xs text-red-500 dark:text-red-400">
					{normError}
				</span>
			)}
		</div>
	);
}
