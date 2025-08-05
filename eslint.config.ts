import baseConfig from "@acdh-oeaw/eslint-config";
import gitignore from "eslint-config-flat-gitignore";
import { config } from "typescript-eslint";

export default config(gitignore({ strict: false }), baseConfig);
