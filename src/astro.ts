import {
	createEnv as _createEnv,
	type CreateEnvParams,
	type Input,
	type Prefixed,
	type Unprefixed,
} from "./index.js";

export function createEnv<
	TPrefix extends "PUBLIC_",
	TShared,
	TClient extends Prefixed<TPrefix, TClient>,
	TServer extends Unprefixed<TPrefix, TServer>,
>(
	params: Omit<CreateEnvParams<TPrefix, TShared, TClient, TServer>, "environment" | "prefix"> & {
		environment: Input;
	},
) {
	return _createEnv({
		...params,
		prefix: "PUBLIC_",
	} as CreateEnvParams<TPrefix, TShared, TClient, TServer>);
}
