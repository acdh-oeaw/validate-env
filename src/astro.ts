import {
	createEnv,
	type CreateEnvParams,
	type Input,
	type Prefixed,
	type Unprefixed,
} from "./index.js";

export function createAstroEnv<
	TPrefix extends string,
	TShared,
	TClient extends Prefixed<TPrefix, TClient>,
	TServer extends Unprefixed<TPrefix, TServer>,
>(params: Omit<CreateEnvParams<TPrefix, TShared, TClient, TServer>, "environment" | "prefix">) {
	return createEnv({
		...params,
		prefix: "PUBLIC_",
		// @ts-expect-error `import.meta.env` exists in `vite` projects.
		environment: import.meta.env as Input,
	} as CreateEnvParams<TPrefix, TShared, TClient, TServer>);
}
