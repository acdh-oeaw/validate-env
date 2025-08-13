import {
	createEnv as _createEnv,
	type CreateEnvParams,
	type Prefixed,
	type Unprefixed,
	ValidationError,
} from "./index.js";

export function createEnv<
	TPrefix extends "NEXT_PUBLIC_",
	TPrivate extends Unprefixed<TPrefix, TPrivate>,
	TPublic extends Prefixed<TPrefix, TPublic>,
	TSystem extends Unprefixed<TPrefix, TSystem>,
>(params: Omit<CreateEnvParams<TPrefix, TPrivate, TPublic, TSystem>, "prefix">) {
	return _createEnv({
		...params,
		prefix: "NEXT_PUBLIC_",
	} as CreateEnvParams<TPrefix, TPrivate, TPublic, TSystem>);
}

export { ValidationError };
