"use client";
import React from "react";
import { AppSchema, type AppValues, Role } from "./schema";
import { AutoForm } from "../AutoForm";
import { useZodForm } from "../utils/useZodForm";
import { SensitiveInput } from "../utils/fields";
import { TextField } from "../components/autofield/components/TextField";
import { TextareaField } from "../components/autofield/components/TextareaField";
import { NumberSliderField } from "../components/autofield/components/NumberField";
import { DateField } from "../components/autofield/components/DateField";
import { DateRangeField } from "../components/autofield/components/DateRangeField";
import { BooleanSelectField } from "../components/autofield/components/BooleanSelectField";
import { SelectField } from "../components/autofield/components/SelectField";
import { FileUploadField } from "../components/autofield/components/FileUploadField";
import { ArrayStringField } from "../components/autofield/components/ArrayStringField";
import { RadioGroupField } from "../components/autofield/components/RadioGroupField";
// import { CheckboxGroupField } from "../components/autofield/components/CheckboxGroupField";

export default function ExampleForm() {
	const today = React.useMemo(() => {
		const t = new Date();
		return new Date(t.getFullYear(), t.getMonth(), t.getDate());
	}, []);

	// Dropdown month/year settings: last 100 years through current year
	const thisYear = React.useMemo(() => new Date().getFullYear(), []);
	const fromYear = thisYear - 100;
	const toYear = thisYear;
	const holidays = React.useMemo(() => {
		// Example holidays: next New Year's Day and Christmas
		const now = new Date();
		const y = now.getFullYear();
		// normalize to date-only
		const d = (y: number, m: number, day: number) => new Date(y, m, day);
		return [d(y, 0, 1), d(y, 11, 25)];
	}, []);
	const leftForm = useZodForm(AppSchema, {
		defaultValues: {
			email: "",
			password: "",
			bio: "",
			age: 30,
			birthday: undefined as any,
			termsAccepted: false,
			startDate: undefined as any,
			endDate: undefined as any,
			role: "user",
			favoriteFruit: "",
			apiKey: "",
			files: undefined as any,
			tags: [],
			favoriteColors: ["red"],
		} as Partial<AppValues>,
	});

	const rightForm = useZodForm(AppSchema, {
		defaultValues: leftForm.getValues(),
	});

	const [leftOutput, setLeftOutput] = React.useState<any>(null);
	const [rightOutput, setRightOutput] = React.useState<any>(null);

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">
				AutoField vs Hand-crafted Fields
			</h2>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Left: AutoForm using AutoField */}
				<div className="space-y-3">
					<h3 className="text-lg font-medium">AutoForm (AutoField)</h3>
					<AutoForm
						form={leftForm}
						schema={AppSchema}
						fields={{
							email: { placeholder: "name@example.com" },
							age: {
								widget: "slider",
								min: 0,
								max: 120,
								step: 1,
								label: "Age",
							},
							birthday: {
								label: "Birthday",
								captionLayout: "dropdown",
								fromYear,
								toYear,
							},
							startDate: {
								label: "Trip Dates",
								widget: "date-range",
								endDateField: "endDate",
								minDate: today,
								holidays,
								disableWeekdays: [0],
								withTime: true,
								numberOfMonths: 2,
								captionLayout: "dropdown",
								fromYear,
								toYear,
							},
							endDate: { widget: "hidden" },
							password: {
								widget: "password",
								label: "Password",
								placeholder: "Enter your password",
							},
							bio: {
								widget: "textarea",
								rows: 4,
								label: "Bio",
								placeholder: "Tell us about yourself",
							},
							termsAccepted: { widget: "select", label: "Accept Terms?" },
							favoriteFruit: {
								widget: "select",
								label: "Favorite Fruit",
								options: [
									{ value: "", label: "-- choose --" },
									{ value: "apple", label: "Apple" },
									{ value: "banana", label: "Banana" },
									{ value: "orange", label: "Orange" },
								],
							},
							apiKey: {
								widget: "password",
								label: "API Key",
								placeholder: "sk-...",
							},
							role: { widget: "radios", label: "Role" },
							tags: { placeholder: "Type a tag and press Enter" },
							favoriteColors: {
								label: "Favorite Colors (multi-select)",
								widget: "select",
								multiple: true,
								options: [
									{ value: "red", label: "red" },
									{ value: "green", label: "green" },
									{ value: "blue", label: "blue" },
								],
							},
						}}
						onSubmit={(vals) => setLeftOutput(vals)}
						submitLabel="Submit"
					/>
					<div className="rounded-md border p-3 text-sm">
						<div className="mb-2 font-medium">Submitted Values (AutoForm)</div>
						<pre className="whitespace-pre-wrap break-words">
							{leftOutput
								? JSON.stringify(leftOutput, null, 2)
								: "(submit to see output)"}
						</pre>
					</div>
				</div>

				{/* Right: Hand-crafted form mirroring fields */}
				<div className="space-y-3">
					<h3 className="text-lg font-medium">Manual Fields (Reference)</h3>
					<form
						onSubmit={rightForm.handleSubmit((vals) => setRightOutput(vals))}
						className="space-y-3"
					>
						{/* Email */}
						<TextField
							name="email"
							label="Email"
							type="email"
							form={rightForm}
							placeholder="name@example.com"
						/>

						{/* Password (SensitiveInput) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">Password</label>
							<SensitiveInput
								name="password"
								register={rightForm.register}
								placeholder="Enter your password"
							/>
						</div>

						{/* Bio (textarea) */}
						<TextareaField
							name="bio"
							label="Bio"
							rows={4}
							form={rightForm}
							placeholder="Tell us about yourself"
						/>

						{/* Age (slider) */}
						<NumberSliderField
							name="age"
							label="Age"
							min={0}
							max={120}
							step={1}
							form={rightForm}
						/>

						{/* Birthday with optional time */}
						<DateField
							name="birthday"
							label="Birthday"
							withTime
							captionLayout="dropdown"
							fromYear={fromYear}
							toYear={toYear}
							form={rightForm}
						/>

						{/* Start/End Dates on a single calendar with time selection and holidays */}
						<DateRangeField
							startName="startDate"
							endName="endDate"
							label="Trip Dates"
							errorStart={
								(rightForm.formState.errors as any).startDate?.message
							}
							errorEnd={(rightForm.formState.errors as any).endDate?.message}
							minDate={today}
							holidays={holidays}
							disableWeekdays={[0]}
							withTime
							numberOfMonths={2}
							captionLayout="dropdown"
							fromYear={fromYear}
							toYear={toYear}
							form={rightForm}
						/>

						{/* Terms Accepted (select true/false) */}
						<BooleanSelectField
							name="termsAccepted"
							label="Accept Terms?"
							opts={[
								{ value: "", label: "-- choose --" },
								{ value: "true", label: "Yes" },
								{ value: "false", label: "No" },
							]}
							form={rightForm}
						/>

						{/* Favorite Fruit (string select) */}
						<SelectField
							name="favoriteFruit"
							label="Favorite Fruit"
							opts={[
								{ value: "", label: "-- choose --" },
								{ value: "apple", label: "Apple" },
								{ value: "banana", label: "Banana" },
								{ value: "orange", label: "Orange" },
							]}
							form={rightForm}
						/>

						{/* API Key (SensitiveInput) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">API Key</label>
							<SensitiveInput
								name="apiKey"
								register={rightForm.register}
								placeholder="sk-..."
							/>
						</div>

						{/* Files (file-upload) */}
						<FileUploadField
							name="files"
							label="Files"
							accept="image/*,application/pdf"
							form={rightForm}
						/>

						{/* Tags (array string via newline) */}
						<ArrayStringField
							name="tags"
							label="Tags"
							form={rightForm}
							placeholder="Type a tag and press Enter"
						/>

						{/* Favorite Colors (multi-select dropdown) */}
						<SelectField
							name="favoriteColors"
							label="Favorite Colors"
							multiple
							opts={[
								{ value: "red", label: "red" },
								{ value: "green", label: "green" },
								{ value: "blue", label: "blue" },
							]}
							form={rightForm}
						/>

						<button
							type="submit"
							className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90"
						>
							Submit
						</button>
					</form>

					<div className="rounded-md border p-3 text-sm">
						<div className="mb-2 font-medium">Submitted Values (Manual)</div>
						<pre className="whitespace-pre-wrap break-words">
							{rightOutput
								? JSON.stringify(rightOutput, null, 2)
								: "(submit to see output)"}
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}
