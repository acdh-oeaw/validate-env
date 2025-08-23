import { err, ok } from "@acdh-oeaw/lib";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import * as v from "valibot";

import { createEnv as createAstroEnv } from "./astro.js";
import { createEnv, ValidationError } from "./index.js";
import { createEnv as createNextEnv } from "./next.js";

const test = suite("createEnv");

test("should validate environment variables", () => {
	const env = createEnv({
		environment: {
			AUTH_URL: "http://localhost:3000/api/auth",
			NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
			NEXT_PUBLIC_BOTS: undefined,
			NODE_ENV: "production",
		},
		prefix: "NEXT_PUBLIC_",
		schemas: {
			system(environment) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			public(environment) {
				const Schema = v.object({
					NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			private(environment) {
				const Schema = v.object({
					AUTH_URL: v.pipe(v.string(), v.url()),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
		},
	});

	assert.is(env.error, null);
	assert.equal(env.value, {
		AUTH_URL: "http://localhost:3000/api/auth",
		NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
		NEXT_PUBLIC_BOTS: "disabled",
		NODE_ENV: "production",
	});
});

test('should only validate public environment variables with `validation="public"`', () => {
	const env = createEnv({
		environment: {
			AUTH_URL: undefined,
			NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
			NEXT_PUBLIC_BOTS: undefined,
			NODE_ENV: "production",
		},
		prefix: "NEXT_PUBLIC_",
		validation: "public",
		schemas: {
			system(environment) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			public(environment) {
				const Schema = v.object({
					NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			private(environment) {
				const Schema = v.object({
					AUTH_URL: v.pipe(v.string(), v.url()),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
		},
	});

	assert.is(env.error, null);
	assert.equal(env.value, {
		AUTH_URL: undefined,
		NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
		NEXT_PUBLIC_BOTS: "disabled",
		NODE_ENV: "production",
	});
});

test("should display type error when environment is missing variables", () => {
	const env = createEnv({
		// @ts-expect-error Environment must include all variables.
		environment: {
			AUTH_URL: "http://localhost:3000/api/auth",
			NEXT_PUBLIC_BOTS: undefined,
			NODE_ENV: "production",
		},
		prefix: "NEXT_PUBLIC_",
		schemas: {
			system(environment) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			public(environment) {
				const Schema = v.object({
					NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			private(environment) {
				const Schema = v.object({
					AUTH_URL: v.pipe(v.string(), v.url()),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
		},
	});

	assert.instance(env.error, ValidationError);
});

test("should display type error when environment has excess variables", () => {
	const env = createEnv({
		environment: {
			AUTH_URL: "http://localhost:3000/api/auth",
			// @ts-expect-error Environment must not include excess variables.
			UNKNOWN: undefined,
			NEXT_PUBLIC_BOTS: undefined,
			NODE_ENV: "production",
		},
		prefix: "NEXT_PUBLIC_",
		schemas: {
			system(environment) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			public(environment) {
				const Schema = v.object({
					NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});
				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			private(environment) {
				const Schema = v.object({
					AUTH_URL: v.pipe(v.string(), v.url()),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
		},
	});

	assert.instance(env.error, ValidationError);
});

test("should display type errors when providing prefixed server-side variables or unprefixed client-side variables", () => {
	const env = createEnv({
		environment: {
			AUTH_URL: "http://localhost:3000/api/auth",
			NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
			NEXT_PUBLIC_BOTS: undefined,
			NODE_ENV: "production",
		},
		prefix: "NEXT_PUBLIC_",
		schemas: {
			system(environment) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			// @ts-expect-error Client-side environment variables must be prefixed.
			public(environment) {
				const Schema = v.object({
					AUTH_URL: v.pipe(v.string(), v.url()),
					NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			// @ts-expect-error Server-side environment variables must not be prefixed.
			private(environment) {
				const Schema = v.object({
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
		},
	});

	assert.is(env.error, null);
});

test("should display error when server-only variables are accessed on client", () => {
	const env = createEnv({
		isClient: true,
		environment: {
			AUTH_URL: "http://localhost:3000/api/auth",
			NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
			NEXT_PUBLIC_BOTS: undefined,
			NEXT_PUBLIC_SEARCH_API_KEY: "",
			NODE_ENV: "production",
		},
		prefix: "NEXT_PUBLIC_",
		schemas: {
			system(environment) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			public(environment) {
				const Schema = v.object({
					NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
					NEXT_PUBLIC_SEARCH_API_KEY: v.optional(v.pipe(v.string(), v.nonEmpty())),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			private(environment) {
				const Schema = v.object({
					AUTH_URL: v.pipe(v.string(), v.url()),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
		},
	});

	assert.is(env.error, null);
	assert.not.throws(() => env.value!.NEXT_PUBLIC_APP_BASE_URL);
	assert.not.throws(() => env.value!.NEXT_PUBLIC_BOTS);
	assert.not.throws(() => env.value!.NEXT_PUBLIC_SEARCH_API_KEY);
	assert.throws(() => env.value!.AUTH_URL, /Invalid property access: AUTH_URL./);
});

test("should use PUBLIC_ prefix when using astro entrypoint", () => {
	const env = createAstroEnv({
		environment: {
			AUTH_URL: "http://localhost:3000/api/auth",
			NODE_ENV: "production",
			PUBLIC_APP_BASE_URL: "http://localhost:3000",
			PUBLIC_BOTS: undefined,
		},
		schemas: {
			system(environment) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			public(environment) {
				const Schema = v.object({
					PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
					PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			private(environment) {
				const Schema = v.object({
					AUTH_URL: v.pipe(v.string(), v.url()),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
		},
	});

	assert.is(env.error, null);
	assert.equal(env.value, {
		AUTH_URL: "http://localhost:3000/api/auth",
		NODE_ENV: "production",
		PUBLIC_APP_BASE_URL: "http://localhost:3000",
		PUBLIC_BOTS: "disabled",
	});
});

test("should use NEXT_PUBLIC_ prefix when using next.js entrypoint", () => {
	const env = createNextEnv({
		environment: {
			AUTH_URL: "http://localhost:3000/api/auth",
			NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
			NEXT_PUBLIC_BOTS: undefined,
			NODE_ENV: "production",
		},
		schemas: {
			system(environment) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			public(environment) {
				const Schema = v.object({
					NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
			private(environment) {
				const Schema = v.object({
					AUTH_URL: v.pipe(v.string(), v.url()),
				});

				const result = v.safeParse(Schema, environment);

				if (!result.success) {
					return err(new ValidationError(v.summarize(result.issues)));
				}

				return ok(result.output);
			},
		},
	});

	assert.is(env.error, null);
	assert.equal(env.value, {
		AUTH_URL: "http://localhost:3000/api/auth",
		NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
		NEXT_PUBLIC_BOTS: "disabled",
		NODE_ENV: "production",
	});
});

test.run();
