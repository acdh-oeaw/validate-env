import { defineConfig } from "tsup";

export default defineConfig({
	clean: true,
	dts: true,
	entry: ["./src/index.ts", "./src/astro.ts", "./src/next.ts"],
	format: ["esm"],
	minify: false,
	sourcemap: true,
	treeshake: true,
});
