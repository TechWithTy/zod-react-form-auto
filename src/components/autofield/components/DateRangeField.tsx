"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Calendar } from "../../../../../../ui/calendar";
import { DateRange } from "react-day-picker";

function startOfDay(d: Date) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function applyTime(base: Date, time: string | undefined) {
	if (!time) return base;
	const [hh, mm] = time.split(":").map((v) => parseInt(v, 10));
	const copy = new Date(base);
	if (!Number.isNaN(hh)) copy.setHours(hh);
	if (!Number.isNaN(mm)) copy.setMinutes(mm);
	copy.setSeconds(0, 0);
	return copy;
}

export function DateRangeField({
	startName,
	endName,
	label,
	errorStart,
	errorEnd,
	minDate,
	maxDate,
	holidays = [],
	disableWeekdays = [],
	withTime,
	numberOfMonths,
	captionLayout,
	fromYear,
	toYear,
	form,
}: {
	startName: string;
	endName: string;
	label: string;
	errorStart?: string;
	errorEnd?: string;
	minDate?: Date;
	maxDate?: Date;
	holidays?: Date[];
	disableWeekdays?: number[]; // 0..6
	withTime?: boolean;
	numberOfMonths?: number;
	captionLayout?: "label" | "dropdown";
	fromYear?: number;
	toYear?: number;
	form: UseFormReturn<any>;
}) {
	const { register, unregister, getValues, watch, setValue } = form;
	const start = watch(startName as any) as Date | undefined;
	const end = watch(endName as any) as Date | undefined;
	const [startTime, setStartTime] = React.useState<string | undefined>(
		start
			? `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`
			: undefined,
	);
	const [endTime, setEndTime] = React.useState<string | undefined>(
		end
			? `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`
			: undefined,
	);

	const selected: DateRange | undefined =
		start || end ? { from: start, to: end } : undefined;

	const disabled = (date: Date) => {
		const d = startOfDay(date);
		if (minDate && d < startOfDay(minDate)) return true;
		if (maxDate && d > startOfDay(maxDate)) return true;
		if (disableWeekdays.includes(d.getDay())) return true;
		if (holidays.some((h) => startOfDay(h).getTime() === d.getTime()))
			return true;
		return false;
	};

	const onSelect = (range: DateRange | undefined) => {
		const from = range?.from ? startOfDay(range.from) : undefined;
		const to = range?.to ? startOfDay(range.to) : undefined;

		// apply time if enabled
		const fromWithTime = from ? applyTime(from, startTime) : undefined;
		const toWithTime = to ? applyTime(to, endTime) : undefined;

		setValue(startName as any, (fromWithTime ?? undefined) as any, {
			shouldValidate: true,
			shouldDirty: true,
			shouldTouch: true,
		});
		setValue(endName as any, (toWithTime ?? undefined) as any, {
			shouldValidate: true,
			shouldDirty: true,
			shouldTouch: true,
		});
	};

	const handleStartTime = (v: string) => {
		setStartTime(v);
		const cur = watch(startName as any) as Date | undefined;
		if (cur) {
			const updated = applyTime(cur, v);
			setValue(startName as any, updated as any, {
				shouldValidate: true,
				shouldDirty: true,
				shouldTouch: true,
			});
		}
	};

	const handleEndTime = (v: string) => {
		setEndTime(v);
		const cur = watch(endName as any) as Date | undefined;
		if (cur) {
			const updated = applyTime(cur, v);
			setValue(endName as any, updated as any, {
				shouldValidate: true,
				shouldDirty: true,
				shouldTouch: true,
			});
		}
	};

	// Normalize vague Zod errors
	const normStart = React.useMemo(() => {
		if (!errorStart) return undefined;
		const t = String(errorStart).trim();
		if (t.toLowerCase() === "invalid input")
			return `${label} start date is required`;
		return errorStart;
	}, [errorStart, label]);
	const normEnd = React.useMemo(() => {
		if (!errorEnd) return undefined;
		const t = String(errorEnd).trim();
		if (t.toLowerCase() === "invalid input")
			return `${label} end date is required`;
		return errorEnd;
	}, [errorEnd, label]);

	// Imperatively register both fields; avoid hidden inputs that can coerce strings on clear
	React.useEffect(() => {
		try {
			register(startName as any);
		} catch {}
		try {
			register(endName as any);
		} catch {}
		// Ensure stored values are Date | undefined
		const v = (getValues() as any)[startName];
		if (v != null && !(v instanceof Date))
			setValue(startName as any, undefined as any, { shouldValidate: true });
		const w = (getValues() as any)[endName];
		if (w != null && !(w instanceof Date))
			setValue(endName as any, undefined as any, { shouldValidate: true });
		return () => {
			try {
				unregister(startName as any);
			} catch {}
			try {
				unregister(endName as any);
			} catch {}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [startName, endName, register, unregister, setValue]);

	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			{/* Imperatively registered; no hidden inputs that bind string values */}
			<div className="rounded-md border border-border p-2">
				<Calendar
					mode="range"
					selected={selected}
					onSelect={onSelect}
					disabled={disabled}
					numberOfMonths={numberOfMonths}
					captionLayout={captionLayout}
					fromYear={fromYear}
					toYear={toYear}
					initialFocus
				/>
			</div>
			{withTime && (
				<div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
					<div className="flex items-center gap-2">
						<label className="w-24 text-xs text-muted-foreground">
							Start time
						</label>
						<input
							type="time"
							className="w-full rounded-md border border-border p-1 text-sm"
							value={startTime ?? ""}
							onChange={(e) => handleStartTime(e.target.value)}
						/>
					</div>
					<div className="flex items-center gap-2">
						<label className="w-24 text-xs text-muted-foreground">
							End time
						</label>
						<input
							type="time"
							className="w-full rounded-md border border-border p-1 text-sm"
							value={endTime ?? ""}
							onChange={(e) => handleEndTime(e.target.value)}
						/>
					</div>
				</div>
			)}
			{(normStart || normEnd) && (
				<div className="space-y-0.5">
					{normStart && (
						<span className="block text-xs text-red-500 dark:text-red-400">
							{normStart}
						</span>
					)}
					{normEnd && (
						<span className="block text-xs text-red-500 dark:text-red-400">
							{normEnd}
						</span>
					)}
				</div>
			)}
		</div>
	);
}
