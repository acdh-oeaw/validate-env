/* eslint-disable @typescript-eslint/no-explicit-any */

import { err, ok, type Result } from "@acdh-oeaw/lib";
import * as v from "valibot";

type Prefixed<T extends v.ObjectEntries> = {
	[K in keyof T]: K extends `NEXT_PUBLIC_${string}` ? T[K] : never;
};

type Unprefixed<T extends v.ObjectEntries> = {
	[K in keyof T]: K extends `NEXT_PUBLIC_${string}` ? never : T[K];
};

export function validate<
	TSystem extends Unprefixed<TSystem>,
	TPrivate extends Unprefixed<TPrivate>,
	TPublic extends Prefixed<TPublic>,
>({
	schemas,
	environment,
	validation = "enabled",
}: {
	schemas: {
		system?: v.ObjectSchema<TSystem, any>;
		private?: v.ObjectSchema<TPrivate, any>;
		public?: v.ObjectSchema<TPublic, any>;
	};
	environment: Record<
		keyof NoInfer<TSystem> | keyof NoInfer<TPrivate> | keyof NoInfer<TPublic>,
		unknown
	>;
	validation?: "disabled" | "enabled" | "public";
}): Result<
	v.InferOutput<
		v.ObjectSchema<NoInfer<TSystem>, any> &
			v.ObjectSchema<NoInfer<TPrivate>, any> &
			v.ObjectSchema<NoInfer<TPublic>, any>
	>,
	EnvValidationError
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

	const isClient = typeof document !== "undefined";

	if (isClient) {
		const schema = v.object({
			...schemas.system?.entries,
			...schemas.public?.entries,
		});

		const result = v.safeParse(schema, environment);

		if (result.success) {
			const proxy = new Proxy(Object.freeze(result.output), {
				get(target, prop) {
					if (prop in target) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-return
						return Reflect.get(target, prop);
					}

					throw new Error(`Invalid property access: ${String(prop)}.`);
				},
			});

			return ok(proxy as any);
		}
	}

	if (validation === "public") {
		const schema = v.object({
			...schemas.system?.entries,
			...schemas.public?.entries,
		});

		const result = v.safeParse(schema, environment);

		if (result.success) {
			return ok(Object.freeze({ ...environment, ...result.output } as any));
		}
	}

	const schema = v.object({
		...schemas.system?.entries,
		...schemas.private?.entries,
		...schemas.public?.entries,
	});

	const result = v.safeParse(schema, environment);

	if (result.success) {
		return ok(Object.freeze(result.output as any));
	}

	return err(new EnvValidationError(v.summarize(result.issues)));
}

export class EnvValidationError extends Error {
	private static readonly type = "EnvValidationError";

	static is(error: unknown): error is EnvValidationError {
		if (error instanceof EnvValidationError) {
			return true;
		}

		return error instanceof Error && error.name === EnvValidationError.type;
	}

	constructor(message?: string) {
		super(message);

		this.name = EnvValidationError.type;
	}
}
