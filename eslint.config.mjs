import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ["data/**", ".next/**"],
  },
  {
    rules: {
      // Flags the standard "fetch in effect, setState with the result"
      // pattern used by useActiveStore/codes page — a correct, common
      // pattern, not a bug. This rule is aimed at React Compiler prep.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
