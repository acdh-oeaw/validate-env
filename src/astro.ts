import {
	createEnv as _createEnv,
	type CreateEnvParams,
	type Input,
	type Prefixed,
	type Unprefixed,
	ValidationError,
} from "./index.js";

export function createEnv<
	TPrefix extends "PUBLIC_",
	TPrivate extends Unprefixed<TPrefix, TPrivate>,
	TPublic extends Prefixed<TPrefix, TPublic>,
	TSystem extends Unprefixed<TPrefix, TSystem>,
>(
	params: Omit<CreateEnvParams<TPrefix, TPrivate, TPublic, TSystem>, "environment" | "prefix"> & {
		environment: Input;
	},
) {
	return _createEnv({
		...params,
		prefix: "PUBLIC_",
	} as CreateEnvParams<TPrefix, TPrivate, TPublic, TSystem>);
}

export { ValidationError };
