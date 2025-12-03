import { defineConfig } from "tsdown";

export default defineConfig({
	clean: true,
	dts: true,
	entry: ["./src/index.ts", "./src/astro.ts", "./src/next.ts", "./src/runtime.ts"],
	format: ["esm"],
	minify: false,
	sourcemap: true,
	treeshake: true,
	unbundle: true,
});
