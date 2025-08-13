/* eslint-disable @typescript-eslint/no-explicit-any */

import { err, ok, type Result } from "@acdh-oeaw/lib";

export class ValidationError extends Error {
	private static readonly type = "ValidationError";

	static is(error: unknown): error is ValidationError {
		if (error instanceof ValidationError) {
			return true;
		}

		return error instanceof Error && error.name === ValidationError.type;
	}

	constructor(message?: string) {
		super(message);

		this.name = ValidationError.type;
	}
}

export class InvalidPropertyAccessError extends Error {
	private static readonly type = "InvalidPropertyAccessError";

	static is(error: unknown): error is InvalidPropertyAccessError {
		if (error instanceof InvalidPropertyAccessError) {
			return true;
		}

		return error instanceof Error && error.name === InvalidPropertyAccessError.type;
	}

	constructor(message?: string) {
		super(message);

		this.name = InvalidPropertyAccessError.type;
	}
}

/** @internal */
export type Prefixed<TPrefix extends string, TInput> = {
	[K in keyof TInput]: K extends `${TPrefix}${string}`
		? unknown
		: `${K & string} must be prefixed with ${TPrefix}`;
};

/** @internal */
export type Unprefixed<TPrefix extends string, TInput> = {
	[K in keyof TInput]: K extends `${TPrefix}${string}`
		? `${K & string} must not be prefixed with ${TPrefix}`
		: unknown;
};

/** @internal */
export type Input = Record<string, unknown>;

/** @internal */
export interface CreateEnvParams<
	TPrefix extends string,
	TPrivate extends Unprefixed<TPrefix, TPrivate>,
	TPublic extends Prefixed<TPrefix, TPublic>,
	TSystem extends Unprefixed<TPrefix, TSystem>,
> {
	prefix: TPrefix;
	schemas: {
		private?: (environment: Input) => Result<TPrivate, ValidationError>;
		public?: (environment: Input) => Result<TPublic, ValidationError>;
		system?: (environment: Input) => Result<TSystem, ValidationError>;
	};
	environment: Record<
		keyof NoInfer<TPrivate> | keyof NoInfer<TPublic> | keyof NoInfer<TSystem>,
		unknown
	>;
	validation?: "disabled" | "enabled" | "public";
	isClient?: boolean;
}

export function createEnv<
	TPrefix extends string,
	TPrivate extends Unprefixed<TPrefix, TPrivate>,
	TPublic extends Prefixed<TPrefix, TPublic>,
	TSystem extends Unprefixed<TPrefix, TSystem>,
>({
	schemas,
	environment,
	validation = "enabled",
	isClient = typeof document !== "undefined",
}: CreateEnvParams<TPrefix, TPrivate, TPublic, TSystem>): Result<
	Readonly<TPrivate & TPublic & TSystem>,
	ValidationError
> {
	for (const [key, value] of Object.entries(environment)) {
		if (value === "") {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete environment[key as keyof typeof environment];
		}
	}

	if (validation === "disabled") {
		return ok(Object.freeze(environment as any));
	}

	const shared = schemas.system?.(environment);

	if (ValidationError.is(shared?.error)) {
		return err(shared.error);
	}

	const build = schemas.public?.(environment);

	if (ValidationError.is(build?.error)) {
		return err(build.error);
	}

	if (isClient) {
		return ok(
			new Proxy(Object.freeze({ ...build?.value, ...shared?.value }), {
				get(target, prop) {
					if (prop in target) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-return
						return Reflect.get(target, prop);
					}

					throw new InvalidPropertyAccessError(`Invalid property access: ${String(prop)}.`);
				},
			}) as any,
		);
	}

	if (validation === "public") {
		return ok(Object.freeze({ ...environment, ...build?.value, ...shared?.value } as any));
	}

	const runtime = schemas.private?.(environment);

	if (ValidationError.is(runtime?.error)) {
		return err(runtime.error);
	}

	return ok(Object.freeze({ ...runtime?.value, ...build?.value, ...shared?.value } as any));
}
