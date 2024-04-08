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
	TShared,
	TClient extends Prefixed<TPrefix, TClient>,
	TServer extends Unprefixed<TPrefix, TServer>,
> {
	prefix: TPrefix;

	shared: (input: Input) => TShared;
	client: (input: Input) => TClient;
	server: (input: Input) => TServer;

	isServer?: boolean;

	environment: Record<keyof TClient | keyof TServer | keyof TShared, unknown>;

	skip?: boolean;

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
		client,
		environment,
		isServer = typeof document === "undefined",
		onError,
		onInvalidAccess,
		prefix: _prefix,
		server,
		shared,
		skip,
	} = params;

	for (const [key, value] of Object.entries(environment)) {
		if (value === "") delete environment[key as keyof typeof environment];
	}

	if (skip === true) return environment as any;

	try {
		if (isServer) {
			const env = Object.freeze({
				...shared(environment),
				...client(environment),
				...server(environment),
			});

			return env;
		}

		const env = Object.freeze({
			...shared(environment),
			...client(environment),
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
