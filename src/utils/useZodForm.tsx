import {
	useForm,
	UseFormProps,
	UseFormReturn,
	FieldValues,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Ensure the form type strictly follows the provided Zod schema and
// remains compatible with react-hook-form's FieldValues constraint.
export function useZodForm<TSchema extends z.ZodType<FieldValues, any, any>>(
	schema: TSchema,
	options?: Omit<UseFormProps<z.infer<TSchema>>, "resolver">,
): UseFormReturn<z.infer<TSchema>> {
	return useForm<z.infer<TSchema>>({
		resolver: zodResolver(
			schema as unknown as z.ZodType<FieldValues, any, any>,
		) as any,
		mode: "onChange",
		criteriaMode: "firstError",
		...(options as any),
	});
}
