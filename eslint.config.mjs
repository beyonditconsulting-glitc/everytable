import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // server.js intentionally uses require() — it's a plain CommonJS
    // Node.js entry point for hosts like cPanel's Node.js Selector,
    // documented in next's own custom-server guide, not app source.
    ignores: ["data/**", ".next/**", "server.js"],
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
