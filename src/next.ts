import {
	createEnv as _createEnv,
	type CreateEnvParams,
	type Prefixed,
	type Unprefixed,
} from "./index.js";

export function createEnv<
	TPrefix extends "NEXT_PUBLIC_",
	TShared,
	TClient extends Prefixed<TPrefix, TClient>,
	TServer extends Unprefixed<TPrefix, TServer>,
>(params: Omit<CreateEnvParams<TPrefix, TShared, TClient, TServer>, "prefix">) {
	return _createEnv({
		...params,
		prefix: "NEXT_PUBLIC_",
	} as CreateEnvParams<TPrefix, TShared, TClient, TServer>);
}
