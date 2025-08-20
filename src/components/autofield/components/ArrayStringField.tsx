"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";

export function ArrayStringField({
	name,
	label,
	error,
	placeholder,
	form,
}: {
	name: string;
	label: string;
	error?: string;
	placeholder?: string;
	form: UseFormReturn<any>;
}) {
	const { register, setValue, watch, unregister, getValues } = form;
	const currentRaw = watch(name as any) as any;
	const tags: string[] = Array.isArray(currentRaw)
		? (currentRaw as string[])
		: [];
	const [input, setInput] = React.useState("");

	// Normalize vague Zod errors
	const normError = React.useMemo(() => {
		if (!error) return undefined;
		const t = String(error).trim();
		if (t.toLowerCase() === "invalid input") return `${label} is required`;
		return error;
	}, [error, label]);

	// Debug: render/status logs
	React.useEffect(() => {
		try {
			console.log("ArrayStringField:render", { name, tags });
		} catch {}
	}, [name, tags]);

	const commitTag = React.useCallback(
		(raw: string) => {
			const t = raw.trim();
			if (!t) return;
			if (tags.includes(t)) return;
			const next = [...tags, t];
			setValue(name as any, next as any, {
				shouldValidate: true,
				shouldDirty: true,
			});
			try {
				console.log("ArrayStringField:add", { name, added: t, next });
			} catch {}
			setInput("");
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[tags, name, setValue],
	);

	const removeTag = (t: string) => {
		const next = tags.filter((x) => x !== t);
		setValue(name as any, next as any, {
			shouldValidate: true,
			shouldDirty: true,
		});
		try {
			console.log("ArrayStringField:remove", { name, removed: t, next });
		} catch {}
	};

	const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			commitTag(input);
		} else if (e.key === "Backspace" && input === "" && tags.length) {
			// Quick remove last tag when input empty
			removeTag(tags[tags.length - 1]);
		}
	};

	const onPaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
		const text = e.clipboardData.getData("text");
		if (text && (text.includes("\n") || text.includes(","))) {
			e.preventDefault();
			const parts = text
				.split(/[\n,]/g)
				.map((s) => s.trim())
				.filter(Boolean);
			if (parts.length) {
				const merged = Array.from(new Set([...tags, ...parts]));
				setValue(name as any, merged as any, {
					shouldValidate: true,
					shouldDirty: true,
				});
			}
		}
	};

	// Keep the field registered without binding a DOM input that would push a string value
	React.useEffect(() => {
		try {
			register(name as any);
		} catch {}

		// Ensure initial value is an array
		const v = (getValues() as any)[name];
		if (!Array.isArray(v)) {
			setValue(name as any, [] as any, { shouldValidate: true });
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
			{/* Field is registered imperatively; no hidden input bound to a string value */}

			<div className="flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border border-border bg-background px-2 py-2">
				{tags.map((t) => (
					<span
						key={t}
						className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground"
					>
						{t}
						<button
							type="button"
							aria-label={`Remove ${t}`}
							className="ml-1 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
							onClick={() => removeTag(t)}
						>
							×
						</button>
					</span>
				))}
				<input
					className="flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={onKeyDown}
					onPaste={onPaste}
					placeholder={placeholder ?? "Type a tag and press Enter"}
				/>
			</div>
			<span className="text-[11px] text-muted-foreground">
				Press Enter or comma to add. Backspace to remove last.
			</span>
			{normError && (
				<span className="text-xs text-red-500 dark:text-red-400">
					{normError}
				</span>
			)}
		</div>
	);
}
