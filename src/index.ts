export class ValidationError extends Error {
	private static readonly type = "ValidationError";

	static is(error: unknown): error is ValidationError {
		if (error instanceof ValidationError) {
			return true;
		}

		return error instanceof Error && error.name === ValidationError.type;
	}

	constructor(message?: string, options?: ErrorOptions) {
		super(message, options);

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

	constructor(message?: string, options?: ErrorOptions) {
		super(message, options);

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
	/**
	 * Schema functions receive the raw environment and return the validated variables.
	 * They should throw a `ValidationError` when validation fails.
	 */
	schemas: {
		private?: (environment: Input) => TPrivate;
		public?: (environment: Input) => TPublic;
		system?: (environment: Input) => TSystem;
	};
	environment: Record<
		keyof NoInfer<TPrivate> | keyof NoInfer<TPublic> | keyof NoInfer<TSystem>,
		unknown
	>;
	validation?: "disabled" | "enabled" | "public";
	isClient?: boolean;
}

/**
 * Validates environment variables.
 *
 * @throws {ValidationError} when any of the provided schemas fails validation.
 */
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
}: CreateEnvParams<TPrefix, TPrivate, TPublic, TSystem>): Readonly<TPrivate & TPublic & TSystem> {
	type Env = Readonly<TPrivate & TPublic & TSystem>;

	for (const [key, value] of Object.entries(environment)) {
		if (value === "") {
			environment[key as keyof typeof environment] = undefined;
		}
	}

	if (validation === "disabled") {
		return Object.freeze(environment) as Env;
	}

	const shared = schemas.system?.(environment);
	const build = schemas.public?.(environment);

	if (isClient) {
		return new Proxy(Object.freeze({ ...build, ...shared }), {
			get(target, prop) {
				if (prop in target) {
					return Reflect.get(target, prop) as unknown;
				}

				throw new InvalidPropertyAccessError(`Invalid property access: ${String(prop)}.`);
			},
		}) as Env;
	}

	if (validation === "public") {
		return Object.freeze({ ...environment, ...build, ...shared }) as Env;
	}

	const runtime = schemas.private?.(environment);

	return Object.freeze({ ...runtime, ...build, ...shared }) as Env;
}
