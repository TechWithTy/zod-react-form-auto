"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";

export function FileUploadField({
	name,
	label,
	error,
	accept,
	min,
	max,
	form,
}: {
	name: string;
	label: string;
	error?: string;
	accept?: string;
	min?: number;
	max?: number;
	form: UseFormReturn<any>;
}) {
	const { register, watch, setValue } = form;
	const value = watch(name as any) as any as File[] | undefined;
	const files: File[] = Array.isArray(value)
		? value
		: typeof FileList !== "undefined" && value && (value as any).length != null
			? Array.from(value as any)
			: [];
	const tooMany = typeof max === "number" && files.length > max;
	const tooFew = typeof min === "number" && files.length < min;

	return (
		<div className="flex flex-col gap-2">
			<span className="text-sm text-muted-foreground">{label}</span>
			<input type="hidden" {...register(name as any)} />
			<input
				accept={accept}
				multiple={typeof max !== "number" || max > 1}
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground file:mr-4 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				type="file"
				onChange={(e) => {
					const list = e.target.files ? Array.from(e.target.files) : [];
					const next = typeof max === "number" ? list.slice(0, max) : list;
					setValue(name as any, next as any, {
						shouldValidate: true,
						shouldDirty: true,
					});
				}}
			/>
			{files.length > 0 && (
				<div className="grid grid-cols-2 gap-2 md:grid-cols-3">
					{files.map((f, idx) => {
						const isImg =
							typeof f.type === "string" && f.type.startsWith("image/");
						const url = isImg ? URL.createObjectURL(f) : undefined;
						return (
							<div
								key={`${f.name}-${idx}`}
								className="relative rounded-md border border-border p-2"
							>
								<button
									type="button"
									className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
									onClick={() => {
										const next = files.filter((_, i) => i !== idx);
										setValue(name as any, next as any, {
											shouldValidate: true,
											shouldDirty: true,
											shouldTouch: true,
										});
									}}
									aria-label="Remove file"
								>
									×
								</button>
								{isImg ? (
									<img
										src={url}
										alt={f.name}
										className="h-24 w-full rounded object-cover"
									/>
								) : (
									<div className="flex h-24 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
										{f.name}
									</div>
								)}
								<div
									className="mt-1 truncate text-xs text-muted-foreground"
									title={`${f.name} • ${(f.size / 1024).toFixed(1)} KB`}
								>
									{f.name} • {(f.size / 1024).toFixed(1)} KB
								</div>
							</div>
						);
					})}
				</div>
			)}
			<div className="flex items-center gap-2 text-xs">
				{typeof min === "number" && (
					<span className="text-muted-foreground">Min: {min}</span>
				)}
				{typeof max === "number" && (
					<span className="text-muted-foreground">Max: {max}</span>
				)}
			</div>
			{(tooMany || tooFew) && (
				<span className="text-xs text-red-500 dark:text-red-400">
					{tooMany
						? `You can upload at most ${max} file(s).`
						: `Please upload at least ${min} file(s).`}
				</span>
			)}
			{error && (
				<span className="text-xs text-red-500 dark:text-red-400">{error}</span>
			)}
		</div>
	);
}
