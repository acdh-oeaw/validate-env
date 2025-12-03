/* eslint-disable @typescript-eslint/no-explicit-any */

import { err, ok, type Result } from "@acdh-oeaw/lib";

import { ValidationError } from "./index.js";

type Input = Record<string, unknown>;

interface CreateEnvParams<TPrivate extends Input> {
	schema: (environment: Input) => Result<TPrivate, ValidationError>;
	environment: Record<keyof NoInfer<TPrivate>, unknown>;
	validation?: "disabled" | "enabled";
}

export function createEnv<TPrivate extends Input>({
	schema,
	environment,
	validation,
}: CreateEnvParams<TPrivate>): Result<Readonly<TPrivate>, ValidationError> {
	for (const [key, value] of Object.entries(environment)) {
		if (value === "") {
			environment[key as keyof typeof environment] = undefined;
		}
	}

	if (validation === "disabled") {
		return ok(Object.freeze(environment as any));
	}

	const runtime = schema(environment);

	if (ValidationError.is(runtime.error)) {
		return err(runtime.error);
	}

	return ok(Object.freeze(runtime.value as any));
}

export { ValidationError };
