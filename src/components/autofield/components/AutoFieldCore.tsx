// "use client";
// import React from "react";
// import { z } from "zod";
// import { UseFormReturn } from "react-hook-form";
// import { type SelectOption } from "../utils/select";
// import { SelectField } from "./SelectField";
// import { BooleanField } from "./BooleanField";
// import { BooleanSelectField } from "./BooleanSelectField";
// import { NumberField, NumberSliderField } from "./NumberField";
// import { DateField } from "./DateField";
// import { DateRangeField } from "./DateRangeField";
// import { TextareaField, CollapsibleTextareaField } from "./TextareaField";
// import { TextField } from "./TextField";
// import { ArrayStringField } from "./ArrayStringField";
// import { FileUploadField } from "./FileUploadField";
// import { CheckboxGroupField } from "./CheckboxGroupField";
// import { RadioGroupField } from "./RadioGroupField";
// import {
// 	unwrapType,
// 	enumStringValuesFromZodEnum,
// 	optionsFromStrings,
// 	booleanSelectOptions,
// 	isSensitiveString,
// 	isMultilineString,
// 	type FieldsConfig,
// 	parseFileUploadConfig,
// } from "../../../utils/utils";
// import { SensitiveInput } from "../../../utils/fields";

// export type AutoFieldProps = {
// 	name: string;
// 	def: z.ZodTypeAny;
// 	form: UseFormReturn<any>;
// 	fields?: FieldsConfig<any>;
// };

// export const AutoFieldCore: React.FC<AutoFieldProps> = ({
// 	name,
// 	def,
// 	form,
// 	fields = {},
// }) => {
// 	const { register, formState, setValue, watch } = form;
// 	const cfg = (fields as any)[name] || {};
// 	const label = cfg.label ?? name;
// 	const error = (formState.errors as any)[name]?.message as string | undefined;

// 	const base = unwrapType(def);

// 	const renderSelect = (opts: SelectOption[], multiple = false) => (
// 		<SelectField
// 			name={name}
// 			label={label}
// 			error={error}
// 			opts={opts}
// 			multiple={multiple}
// 			form={form}
// 		/>
// 	);

// 	// Configured widgets
// 	if ((cfg as any).widget === "hidden") {
// 		return null;
// 	}

// 	if ((cfg as any).widget === "date-range") {
// 		const endField = (cfg as any).endDateField as string | undefined;
// 		if (!endField) {
// 			return <DateField name={name} label={label} error={error} form={form} />;
// 		}
// 		const errorStart = (formState.errors as any)[name]?.message as
// 			| string
// 			| undefined;
// 		const errorEnd = (formState.errors as any)[endField]?.message as
// 			| string
// 			| undefined;
// 		return (
// 			<DateRangeField
// 				startName={name}
// 				endName={endField}
// 				label={label}
// 				errorStart={errorStart}
// 				errorEnd={errorEnd}
// 				minDate={(cfg as any).minDate}
// 				maxDate={(cfg as any).maxDate}
// 				holidays={(cfg as any).holidays}
// 				disableWeekdays={(cfg as any).disableWeekdays}
// 				withTime={Boolean((cfg as any).withTime)}
// 				form={form}
// 			/>
// 		);
// 	}
// 	if ((cfg as any).widget === "select") {
// 		const opts = ((cfg as any).options ?? []) as SelectOption[];
// 		return renderSelect(opts, Boolean((cfg as any).multiple));
// 	}
// 	if ((cfg as any).widget === "textarea") {
// 		return (
// 			<TextareaField
// 				name={name}
// 				label={label}
// 				error={error}
// 				rows={(cfg as any).rows}
// 				form={form}
// 			/>
// 		);
// 	}
// 	if ((cfg as any).widget === "password") {
// 		return (
// 			<div className="flex flex-col gap-1">
// 				<span className="text-sm text-muted-foreground">{label}</span>
// 				<SensitiveInput name={name} register={register} />
// 				{error && (
// 					<span className="text-xs text-red-500 dark:text-red-400">
// 						{error}
// 					</span>
// 				)}
// 			</div>
// 		);
// 	}
// 	if ((cfg as any).widget === "slider") {
// 		return (
// 			<NumberSliderField
// 				name={name}
// 				label={label}
// 				error={error}
// 				min={(cfg as any).min}
// 				max={(cfg as any).max}
// 				step={(cfg as any).step}
// 				form={form}
// 			/>
// 		);
// 	}

// 	// Enums -> select
// 	if (
// 		base instanceof z.ZodEnum ||
// 		(base as any)?._def?.values ||
// 		(base as any)?.options
// 	) {
// 		const values = enumStringValuesFromZodEnum(base as any);
// 		const opts = optionsFromStrings(values);
// 		if ((cfg as any).widget === "radios") {
// 			return (
// 				<RadioGroupField
// 					name={name}
// 					label={label}
// 					error={error}
// 					opts={opts}
// 					form={form}
// 				/>
// 			);
// 		}
// 		return renderSelect(opts, Boolean((cfg as any).multiple));
// 	}

// 	// Union of enums/strings/literals -> select
// 	if (
// 		base instanceof z.ZodUnion ||
// 		Array.isArray((base as any)?._def?.options)
// 	) {
// 		const options: z.ZodTypeAny[] = (base as any)?._def?.options ?? [];
// 		const stringVals: string[] = [];
// 		for (const opt of options) {
// 			if (
// 				opt instanceof z.ZodEnum ||
// 				(opt as any)?._def?.values ||
// 				(opt as any)?.options
// 			) {
// 				for (const v of enumStringValuesFromZodEnum(opt as any))
// 					if (typeof v === "string") stringVals.push(v);
// 			} else if ((opt as any)?._def?.typeName === "ZodLiteral") {
// 				const litVal = (opt as any)._def?.value;
// 				if (typeof litVal === "string") stringVals.push(litVal);
// 			}
// 		}
// 		if (stringVals.length)
// 			return renderSelect(
// 				Array.from(new Set(stringVals)).map((v) => ({ value: v, label: v })),
// 				Boolean((cfg as any).multiple),
// 			);
// 	}

// 	// Array -> multi select or textarea
// 	if (base instanceof z.ZodArray) {
// 		const el = (base as any)?._def?.type as z.ZodTypeAny;
// 		if (
// 			el instanceof z.ZodEnum ||
// 			(el as any)?._def?.values ||
// 			(el as any)?.options
// 		) {
// 			const values = enumStringValuesFromZodEnum(el as any);
// 			const opts = optionsFromStrings(values);
// 			if ((cfg as any).widget === "checkboxes") {
// 				return (
// 					<CheckboxGroupField
// 						name={name}
// 						label={label}
// 						error={error}
// 						opts={opts}
// 						form={form}
// 					/>
// 				);
// 			}
// 			return renderSelect(opts, true);
// 		}
// 		if (el instanceof z.ZodString && (cfg as any).options?.length)
// 			return renderSelect((cfg as any).options!, true);
// 		if (el instanceof z.ZodString)
// 			return (
// 				<ArrayStringField
// 					name={name}
// 					label={label}
// 					error={error}
// 					rows={(cfg as any).rows}
// 					placeholder={(cfg as any).placeholder}
// 					form={form}
// 				/>
// 			);
// 	}

// 	// Boolean
// 	if (base instanceof z.ZodBoolean) {
// 		if ((cfg as any).widget === "select") {
// 			const opts = booleanSelectOptions((cfg as any).options as SelectOption[]);
// 			return (
// 				<BooleanSelectField
// 					name={name}
// 					label={label}
// 					error={error}
// 					opts={opts}
// 					form={form}
// 				/>
// 			);
// 		}
// 		return <BooleanField name={name} label={label} error={error} form={form} />;
// 	}

// 	// Number
// 	if (base instanceof z.ZodNumber) {
// 		if ((cfg as any).widget === "slider") {
// 			return (
// 				<NumberSliderField
// 					name={name}
// 					label={label}
// 					error={error}
// 					min={(cfg as any).min}
// 					max={(cfg as any).max}
// 					step={(cfg as any).step}
// 					form={form}
// 				/>
// 			);
// 		}
// 		return <NumberField name={name} label={label} error={error} form={form} />;
// 	}

// 	// Date
// 	if (base instanceof z.ZodDate) {
// 		const minFromField = (cfg as any).minDateField
// 			? (form.watch((cfg as any).minDateField) as Date | undefined)
// 			: undefined;
// 		const maxFromField = (cfg as any).maxDateField
// 			? (form.watch((cfg as any).maxDateField) as Date | undefined)
// 			: undefined;
// 		return (
// 			<DateField
// 				name={name}
// 				label={label}
// 				error={error}
// 				minDate={(cfg as any).minDate ?? minFromField}
// 				maxDate={(cfg as any).maxDate ?? maxFromField}
// 				form={form}
// 			/>
// 		);
// 	}

// 	// String
// 	if (base instanceof z.ZodString) {
// 		const stringDef = (def as any)._def as {
// 			description?: string;
// 			checks?: Array<{ kind: string; regex?: RegExp }>;
// 		};
// 		const checks = stringDef.checks ?? [];
// 		const regexCheck = checks.find((c) => c.kind === "regex" && c.regex);
// 		const isEmail = checks.some((c) => c.kind === "email");
// 		const sensitive = isSensitiveString(stringDef, cfg as any);
// 		const multiline = isMultilineString(stringDef, cfg as any);

// 		if (sensitive) {
// 			return (
// 				<div className="flex flex-col gap-1">
// 					<span className="text-sm text-muted-foreground">{label}</span>
// 					<SensitiveInput name={name} register={register} />
// 					{error && (
// 						<span className="text-xs text-red-500 dark:text-red-400">
// 							{error}
// 						</span>
// 					)}
// 				</div>
// 			);
// 		}

// 		if ((cfg as any).widget === "select" || (cfg as any).options?.length) {
// 			const opts = (cfg as any).options ?? [];
// 			return renderSelect(opts, Boolean((cfg as any).multiple));
// 		}

// 		if (multiline) {
// 			return (
// 				<CollapsibleTextareaField
// 					name={name}
// 					label={label}
// 					error={error}
// 					rows={(cfg as any).rows}
// 					form={form}
// 				/>
// 			);
// 		}

// 		return (
// 			<TextField
// 				name={name}
// 				label={label}
// 				error={error}
// 				placeholder={(cfg as any).placeholder}
// 				pattern={regexCheck?.regex ? regexCheck.regex.source : undefined}
// 				type={isEmail ? "email" : "text"}
// 				form={form}
// 			/>
// 		);
// 	}

// 	// File upload
// 	if (String((def as any).description ?? "").startsWith("file-upload")) {
// 		const fileCfg = parseFileUploadConfig((def as any)._def, cfg as any);
// 		return (
// 			<FileUploadField
// 				name={name}
// 				label={label}
// 				error={error}
// 				accept={fileCfg.accept}
// 				min={fileCfg.min}
// 				max={fileCfg.max}
// 				form={form}
// 			/>
// 		);
// 	}

// 	// Fallback text input
// 	return <TextField name={name} label={label} error={error} form={form} />;
// };
