# @your-scope/zod-react-form-auto (local externalized)

A small AutoForm for React + Zod + react-hook-form that renders fields from a Zod schema. This is the externalized copy living inside this repo for local integration and testing.

## Install (when published)

```bash
pnpm add @your-scope/autoform zod react react-dom react-hook-form @hookform/resolvers
```

Peer dependencies expected in the host app: react, react-dom, react-hook-form, zod, @hookform/resolvers.

## Local usage (pre-publish)

While this folder lives inside the app repo, you can import directly from the local source:

```ts
import { AutoForm, useZodForm } from "../../components/external/zod-react-form-auto/src";
import "../../components/external/zod-react-form-auto/styles/index.css";
```

## Next.js example (React 19)

```tsx
import { z } from "zod";
import { useZodForm, AutoForm } from "@your-scope/autoform";

const schema = z.object({
  name: z.string().min(1),
  temperature: z.number().min(0).max(1).default(0.7),
  language: z.enum(["en", "es"]).default("en"),
});

export default function Page() {
  const form = useZodForm(schema, { defaultValues: { name: "" } });
  return (
    <AutoForm
      schema={schema}
      form={form}
      onSubmit={(values) => console.log(values)}
      fields={{
        temperature: { widget: "slider", min: 0, max: 1, step: 0.1 },
        language: {
          widget: "select",
          options: [
            { value: "en", label: "English" },
            { value: "es", label: "Spanish" },
          ],
        },
      }}
    />
  );
}
```

## Exports

- AutoForm
- AutoField
- useZodForm
- unwrapType
- types: FieldsConfig, AutoFieldProps

## Styles

A minimal default stylesheet is available at `@your-scope/autoform/styles` and in this local copy under `styles/index.css`.
