import { z } from "zod";

export const Role = z.enum(["user", "admin", "moderator"]).describe("select");

export const AppSchema = z
	.object({
		email: z
			.string()
			.email({ message: "Please enter a valid email address" })
			.describe("Email address of the user"),
		password: z
			.string()
			.min(6, { message: "Password must be at least 6 characters" })
			.describe("password"), // will render as SensitiveInput
		bio: z
			.string()
			.max(500, { message: "Bio must be 500 characters or less" })
			.describe("multiline"), // will render as textarea
		age: z
			.number()
			.min(0, { message: "Age cannot be negative" })
			.max(120, { message: "Please enter a realistic age (<= 120)" })
			.describe("Age in years"),
		birthday: z.date().describe("Date of birth (uses Calendar date picker)"),
		startDate: z
			.date()
			.refine(
				(d) => {
					const today = new Date();
					const t = new Date(
						today.getFullYear(),
						today.getMonth(),
						today.getDate(),
					);
					const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
					return dd >= t;
				},
				{ message: "Start date cannot be in the past" },
			)
			.describe("Project start date (not before today)"),
		endDate: z
			.date()
			.describe("Project end date (after or equal to start date)"),
		termsAccepted: z.boolean().describe("Agree to terms"),
		role: Role, // enum -> select
		favoriteFruit: z.string().describe("select"), // string -> select via fields.options
		apiKey: z
			.string()
			.min(1, { message: "API key is required" })
			.describe("sensitive"), // sensitive string example
		files: z
			.any()
			// Accept images and PDF, require at least 1 and at most 5
			// The component reads accept/min/max from this description
			.describe("file-upload:accept=image/*,application/pdf;min=1;max=5"),
		tags: z.array(z.string()).default([]).describe("multiline"), // array of string -> textarea lines
		favoriteColors: z
			.array(z.enum(["red", "green", "blue"])) // array of enum -> multiselect
			.default([]),
	})
	.superRefine((vals, ctx) => {
		if (vals.startDate && vals.endDate) {
			const s = new Date(
				vals.startDate.getFullYear(),
				vals.startDate.getMonth(),
				vals.startDate.getDate(),
			);
			const e = new Date(
				vals.endDate.getFullYear(),
				vals.endDate.getMonth(),
				vals.endDate.getDate(),
			);
			if (e < s) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["endDate"],
					message: "End date cannot be before start date",
				});
			}
		}
	})
	.describe("Example application form");

export type AppValues = z.infer<typeof AppSchema>;
