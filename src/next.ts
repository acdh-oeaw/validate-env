import { createEnv, type CreateEnvParams, type Prefixed, type Unprefixed } from "./index.js";

export function createNextEnv<
	TPrefix extends string,
	TShared,
	TClient extends Prefixed<TPrefix, TClient>,
	TServer extends Unprefixed<TPrefix, TServer>,
>(params: Omit<CreateEnvParams<TPrefix, TShared, TClient, TServer>, "prefix">) {
	return createEnv({
		...params,
		prefix: "NEXT_PUBLIC_",
	} as CreateEnvParams<TPrefix, TShared, TClient, TServer>);
}
