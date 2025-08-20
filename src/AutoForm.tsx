"use client";
import type { FieldsConfig } from "./utils/utils";
import { unwrapToZodObject } from "./utils/utils";

import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

import { AutoField } from "./AutoField";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";

type AutoFormProps<TSchema extends z.ZodObject<any, any>> = {
	schema: TSchema;
	form: UseFormReturn<z.infer<TSchema>>;
	fields?: FieldsConfig<z.infer<TSchema>>;
	onSubmit: (values: z.infer<TSchema>) => void | Promise<void>;
	submitLabel?: string;
	className?: string;
};

export function AutoForm<TSchema extends z.ZodObject<any, any>>({
	schema,
	form,
	fields = {},
	onSubmit,
	submitLabel = "Save",
	className,
}: AutoFormProps<TSchema>) {
	const { handleSubmit, formState } = form;
	// Unwrap potential wrappers (Effects/Readonly/Branded/Pipeline/etc) but stop at ZodObject
	const baseSchema = unwrapToZodObject(
		schema as unknown as z.ZodTypeAny,
	) as any;
	if (process.env.NODE_ENV !== "production") {
		try {
			console.debug("[AutoFormDebug] baseSchema", {
				incomingType: (schema as any)?.constructor?.name,
				baseType: (baseSchema as any)?.constructor?.name,
				shapeKeys:
					typeof baseSchema?._def?.shape === "function"
						? Object.keys((baseSchema._def.shape() as any) ?? {})
						: Object.keys((baseSchema?.shape as any) ?? {}),
			});
		} catch {}
	}

	// Support Zod versions where shape is a function vs. a plain object
	let shape: Record<string, z.ZodTypeAny> = {} as any;
	try {
		if (typeof baseSchema?._def?.shape === "function") {
			shape = baseSchema._def.shape() as Record<string, z.ZodTypeAny>;
		} else if (baseSchema?.shape && typeof baseSchema.shape === "object") {
			shape = baseSchema.shape as Record<string, z.ZodTypeAny>;
		}
	} catch {}

	if (!shape || Object.keys(shape).length === 0) {
		if (process.env.NODE_ENV !== "production") {
			try {
				console.warn("AutoForm: empty shape", {
					incomingType: (schema as any)?.constructor?.name,
					baseType: (baseSchema as any)?.constructor?.name,
				});
			} catch {}
		}
		shape = {} as any;
	}

	const keys = Object.keys(shape);

	// Flatten errors into dotted paths with messages (cycle-safe and selective)
	const flatErrors = React.useMemo(() => {
		const out: Array<{ name: string; message: string }> = [];
		const visited = new WeakSet<object>();
		const skipKeys = new Set(["message", "type", "types", "ref"]);
		const walk = (node: any, prefix: string[]) => {
			if (!node || typeof node !== "object") return;
			if (visited.has(node as object)) return;
			visited.add(node as object);
			for (const k of Object.keys(node)) {
				if (skipKeys.has(k)) continue;
				const next: any = (node as any)[k];
				const path = [...prefix, k];
				if (next && typeof next === "object") {
					const msg = (next as any).message as string | undefined;
					if (msg) out.push({ name: path.join("."), message: msg });
					walk(next, path);
				}
			}
		};
		walk(formState.errors as any, []);
		return out;
	}, [formState.errors]);

	const invalidSummary = React.useMemo(() => {
		if (!flatErrors.length) return null;
		return flatErrors.map(({ name, message }) => {
			const label =
				(fields as any)?.[name]?.label ?? name.split(".").pop() ?? name;
			const norm =
				String(message).trim().toLowerCase() === "invalid input"
					? `${label} is required`
					: message;
			return { label, message: norm };
		});
	}, [flatErrors, fields]);

	const invalidTooltip = React.useMemo(() => {
		if (!invalidSummary || invalidSummary.length === 0) return undefined;
		return invalidSummary.map((it) => `${it.label}: ${it.message}`).join("\n");
	}, [invalidSummary]);

	return (
		<form
			className={className ?? "space-y-3"}
			onSubmit={handleSubmit(onSubmit)}
		>
			{keys.map((key) => {
				const def = shape[key];

				if (process.env.NODE_ENV !== "production") {
					try {
						console.debug("[AutoFormDebug] field", {
							key,
							type: def?.constructor?.name,
							defType: typeof def,
							defKeys:
								def && typeof def === "object"
									? Object.keys(def as any)
									: undefined,
						});
					} catch {}
				}
				// Support nested object fields by rendering their children with dotted names
				if (def instanceof z.ZodObject) {
					const innerShape: Record<string, z.ZodTypeAny> =
						typeof (def as any)._def?.shape === "function"
							? ((def as any)._def.shape() as Record<string, z.ZodTypeAny>)
							: ((def as any).shape as Record<string, z.ZodTypeAny>);

					return (
						<fieldset key={key} className="rounded-md border border-border p-2">
							<legend className="px-1 text-xs uppercase tracking-wide text-muted-foreground">
								{key}
							</legend>
							<div className="space-y-2">
								{Object.keys(innerShape).map((childKey) => {
									const name = `${key}.${childKey}`;
									const childDef = innerShape[childKey];

									return (
										<AutoField
											key={name}
											def={childDef}
											fields={fields as any}
											form={form}
											name={name}
										/>
									);
								})}
							</div>
						</fieldset>
					);
				}

				return (
					<AutoField
						key={key}
						def={def}
						fields={fields as any}
						form={form}
						name={key}
					/>
				);
			})}
			{Boolean(invalidSummary?.length) && (
				<div className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs">
					<div className="mb-1 font-medium text-destructive">
						{invalidSummary!.length} field
						{invalidSummary!.length > 1 ? "s" : ""} need attention
					</div>
					<ul className="list-inside list-disc space-y-0.5 text-destructive">
						{invalidSummary!.map((it) => (
							<li key={it.label}>
								<span className="font-medium">{it.label}:</span> {it.message}
							</li>
						))}
					</ul>
				</div>
			)}
			{!formState.isValid ? (
				<TooltipProvider>
					<Tooltip
						onOpenChange={(open) => {
							if (open) {
								try {
									void form.trigger();
								} catch {}
							}
						}}
					>
						<TooltipTrigger asChild>
							<span
								className="inline-block"
								onMouseEnter={() => {
									try {
										void form.trigger();
									} catch {}
								}}
							>
								<button
									className="pointer-events-none inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
									disabled
									type="submit"
								>
									{submitLabel}
								</button>
							</span>
						</TooltipTrigger>
						<TooltipContent forceMount>
							<div className="max-w-xs whitespace-pre-wrap">
								{formState.isValidating
									? "Validating..."
									: (invalidTooltip ?? "Complete required fields")}
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			) : (
				<button
					className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
					type="submit"
				>
					{submitLabel}
				</button>
			)}
		</form>
	);
}
