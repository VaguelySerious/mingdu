import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const coreWebVitals = compat.extends("next/core-web-vitals");

const eslintConfig = [
  {
    ...coreWebVitals,
    ignores: [...coreWebVitals.ignores, "components/old-src/**"],
  },
];

export default eslintConfig;
