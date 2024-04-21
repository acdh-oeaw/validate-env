/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */

/** @internal */
export type Prefixed<TPrefix extends string, TInput> = {
	[K in keyof TInput]: K extends `${TPrefix}${string}`
		? unknown
		: `${K & string} must be prefixed with ${TPrefix}`;
};

/** @internal */
export type Unprefixed<TPrefix extends string, TInput> = {
	[K in keyof TInput]: K extends `${TPrefix}${string}`
		? `${K & string} must be prefixed with ${TPrefix}`
		: unknown;
};

/** @internal */
export type Input = Record<string, unknown>;

/** @internal */
export interface CreateEnvParams<
	TPrefix extends string,
	TSystem,
	TPublic extends Prefixed<TPrefix, TPublic>,
	TPrivate extends Unprefixed<TPrefix, TPrivate>,
> {
	prefix: TPrefix;

	system: (input: Input) => TSystem;
	public: (input: Input) => TPublic;
	private: (input: Input) => TPrivate;

	isServer?: boolean;

	environment: Record<keyof TPrivate | keyof TPublic | keyof TSystem, unknown>;

	validation?: "disabled" | "enabled" | "public";

	onError?: (error: Error) => never;
	onInvalidAccess?: (key: string) => never;
}

export function createEnv<
	TPrefix extends string,
	TShared,
	TClient extends Prefixed<TPrefix, TClient>,
	TServer extends Unprefixed<TPrefix, TServer>,
>(
	params: CreateEnvParams<TPrefix, TShared, TClient, TServer>,
): Readonly<TClient & TServer & TShared> {
	const {
		public: client,
		environment,
		isServer = typeof document === "undefined",
		onError,
		onInvalidAccess,
		prefix: _prefix,
		private: server,
		system: shared,
		validation,
	} = params;

	for (const [key, value] of Object.entries(environment)) {
		if (value === "") delete environment[key as keyof typeof environment];
	}

	if (validation === "disabled") return Object.freeze(environment) as any;

	try {
		if (isServer) {
			if (validation === "public") {
				const env = Object.freeze({
					...environment,
					...client(environment),
					...shared(environment),
				});

				return env as any;
			}

			const env = Object.freeze({
				...server(environment),
				...client(environment),
				...shared(environment),
			});

			return env;
		}

		const env = Object.freeze({
			...client(environment),
			...shared(environment),
		});

		const proxy = new Proxy(env, {
			get(target, key) {
				if (key in target) return Reflect.get(target, key);

				if (onInvalidAccess != null) {
					onInvalidAccess(String(key));
				}

				throw new Error(`Invalid property access: ${String(key)}.`);
			},
		});

		return proxy as any;
	} catch (error) {
		if (error instanceof Error && onError != null) {
			onError(error);
		}

		throw error;
	}
}
