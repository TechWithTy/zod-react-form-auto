import React from "react";
import { UseFormRegister } from "react-hook-form";

export const SensitiveInput: React.FC<{
	name: string;
	register: UseFormRegister<any>;
	placeholder?: string;
}> = ({ name, register, placeholder }) => {
	const [show, setShow] = React.useState(false);

	return (
		<div className="relative">
			<input
				className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pr-20 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
				type={show ? "text" : "password"}
				placeholder={placeholder}
				{...register(name as any)}
			/>
			<button
				className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-zinc-300 bg-white px-2 py-0.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
				type="button"
				onClick={() => setShow((s) => !s)}
			>
				{show ? "Hide" : "Show"}
			</button>
		</div>
	);
};
