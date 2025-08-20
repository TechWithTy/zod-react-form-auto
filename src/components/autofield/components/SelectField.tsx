"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { SimpleSelect, MultiSelect, type SelectOption } from "../utils/select";

export function SelectField({
	name,
	label,
	error,
	multiple,
	opts,
	form,
}: {
	name: string;
	label: string;
	error?: string;
	multiple?: boolean;
	opts: SelectOption[];
	form: UseFormReturn<any>;
}) {
	const { register, setValue, watch } = form;

	if (multiple) {
		const raw = watch(name as any) as any;
		const current = Array.isArray(raw) ? (raw as string[]) : [];
		const allowed = new Set(opts.map((o) => o.value));
		const sanitized = current.filter((v) => allowed.has(v));
		if (sanitized.length !== current.length) {
			setValue(name as any, sanitized as any, {
				shouldValidate: true,
				shouldDirty: true,
				shouldTouch: true,
			});
		}
		return (
			<MultiSelect
				name={name}
				label={label}
				value={sanitized}
				opts={opts}
				error={error}
				register={register}
				onChange={(v) =>
					setValue(name as any, v as any, {
						shouldValidate: true,
						shouldDirty: true,
						shouldTouch: true,
					})
				}
			/>
		);
	}

	const current = (watch(name as any) as any) ?? "";
	return (
		<SimpleSelect
			name={name}
			label={label}
			value={current as string}
			opts={opts}
			error={error}
			register={register}
			onChange={(v) =>
				setValue(name as any, v as any, {
					shouldValidate: true,
					shouldDirty: true,
				})
			}
		/>
	);
}
