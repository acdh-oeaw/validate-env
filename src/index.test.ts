import { suite } from "uvu";
import * as assert from "uvu/assert";
import * as v from "valibot";

import { createEnv as createAstroEnv } from "./astro.js";
import { createEnv } from "./index.js";
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
		system(input) {
			const Schema = v.object({
				NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
			});
			return v.parse(Schema, input);
		},
		public(input) {
			const Schema = v.object({
				NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
				NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
			});
			return v.parse(Schema, input);
		},
		private(input) {
			const Schema = v.object({
				AUTH_URL: v.pipe(v.string(), v.url()),
			});
			return v.parse(Schema, input);
		},
	});

	assert.equal(env, {
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
		system(input) {
			const Schema = v.object({
				NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
			});
			return v.parse(Schema, input);
		},
		public(input) {
			const Schema = v.object({
				NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
				NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
			});
			return v.parse(Schema, input);
		},
		private(input) {
			const Schema = v.object({
				AUTH_URL: v.pipe(v.string(), v.url()),
			});
			return v.parse(Schema, input);
		},
	});

	assert.equal(env, {
		AUTH_URL: undefined,
		NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
		NEXT_PUBLIC_BOTS: "disabled",
		NODE_ENV: "production",
	});
});

test("should display type error when environment is missing variables", () => {
	const env = () =>
		createEnv({
			// @ts-expect-error Environment must include all variables.
			environment: {
				AUTH_URL: "http://localhost:3000/api/auth",
				NEXT_PUBLIC_BOTS: undefined,
				NODE_ENV: "production",
			},
			prefix: "NEXT_PUBLIC_",
			system(input) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});
				return v.parse(Schema, input);
			},
			public(input) {
				const Schema = v.object({
					NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});
				return v.parse(Schema, input);
			},
			private(input) {
				const Schema = v.object({
					AUTH_URL: v.pipe(v.string(), v.url()),
				});
				return v.parse(Schema, input);
			},
		});

	assert.throws(env);
});

test("should display type error when environment has excess variables", () => {
	const env = () =>
		createEnv({
			environment: {
				AUTH_URL: "http://localhost:3000/api/auth",
				// @ts-expect-error Environment must not include excess variables.
				UNKNOWN: undefined,
				NEXT_PUBLIC_BOTS: undefined,
				NODE_ENV: "production",
			},
			prefix: "NEXT_PUBLIC_",
			system(input) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});
				return v.parse(Schema, input);
			},
			public(input) {
				const Schema = v.object({
					NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});
				return v.parse(Schema, input);
			},
			private(input) {
				const Schema = v.object({
					AUTH_URL: v.pipe(v.string(), v.url()),
				});
				return v.parse(Schema, input);
			},
		});

	assert.throws(env);
});

test("should display type errors when providing prefixed server-side variables or unprefixed client-side variables", () => {
	const env = () =>
		createEnv({
			environment: {
				AUTH_URL: "http://localhost:3000/api/auth",
				NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
				NEXT_PUBLIC_BOTS: undefined,
				NODE_ENV: "production",
			},
			prefix: "NEXT_PUBLIC_",
			system(input) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});
				return v.parse(Schema, input);
			},
			// @ts-expect-error Client-side environment variables must be prefixed.
			public(input) {
				const Schema = v.object({
					AUTH_URL: v.pipe(v.string(), v.url()),
					NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
				});
				return v.parse(Schema, input);
			},
			// @ts-expect-error Server-side environment variables must not be prefixed.
			private(input) {
				const Schema = v.object({
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});
				return v.parse(Schema, input);
			},
		});

	// TODO: should this throw a runtime error? would require passing filtered `environment` to `client()` and `server()`.
	assert.not.throws(env);
});

test("should display default validation error", () => {
	const env = () =>
		createEnv({
			environment: {
				AUTH_URL: "http://localhost:3000/api/auth",
				NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
				NEXT_PUBLIC_BOTS: "yes",
				NODE_ENV: "production",
			},
			prefix: "NEXT_PUBLIC_",
			system(input) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});
				return v.parse(Schema, input);
			},
			public(input) {
				const Schema = v.object({
					NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});
				return v.parse(Schema, input);
			},
			private(input) {
				const Schema = v.object({
					AUTH_URL: v.pipe(v.string(), v.url()),
				});
				return v.parse(Schema, input);
			},
		});

	assert.throws(env, /Invalid type: Expected \("disabled" | "enabled"\) but received "yes"/);
});

test("should display custom validation error", () => {
	const env = () =>
		createEnv({
			environment: {
				AUTH_URL: "http://localhost:3000/api/auth",
				NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
				NEXT_PUBLIC_BOTS: "yes",
				NODE_ENV: "production",
			},
			prefix: "NEXT_PUBLIC_",
			system(input) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});
				return v.parse(Schema, input);
			},
			public(input) {
				const Schema = v.object({
					NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});
				return v.parse(Schema, input);
			},
			private(input) {
				const Schema = v.object({
					AUTH_URL: v.pipe(v.string(), v.url()),
				});
				return v.parse(Schema, input);
			},
			onError(error) {
				if (v.isValiError(error)) {
					throw new Error(`❌ Invalid environment variables:\n${v.summarize(error.issues)}`);
				}

				throw error;
			},
		});

	assert.throws(
		env,
		/Invalid environment variables:\n× Invalid type: Expected \("disabled" \| "enabled"\) but received "yes"\n {2}→ at NEXT_PUBLIC_BOTS/,
	);
});

test("should display error when server-only variables are accessed on client", () => {
	const env = createEnv({
		isServer: false,
		environment: {
			AUTH_URL: "http://localhost:3000/api/auth",
			NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
			NEXT_PUBLIC_BOTS: undefined,
			NODE_ENV: "production",
		},
		prefix: "NEXT_PUBLIC_",
		system(input) {
			const Schema = v.object({
				NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
			});
			return v.parse(Schema, input);
		},
		public(input) {
			const Schema = v.object({
				NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
				NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
			});
			return v.parse(Schema, input);
		},
		private(input) {
			const Schema = v.object({
				AUTH_URL: v.pipe(v.string(), v.url()),
			});
			return v.parse(Schema, input);
		},
		onInvalidAccess(key) {
			throw new Error(
				`❌ Attempted to access a server-side environment variable on the client: ${key}.`,
			);
		},
	});

	assert.not.throws(() => env.NEXT_PUBLIC_APP_BASE_URL);
	assert.throws(
		() => env.AUTH_URL,
		/Attempted to access a server-side environment variable on the client/,
	);
});

test("should use PUBLIC_ prefix when using astro entrypoint", () => {
	const env = createAstroEnv({
		environment: {
			AUTH_URL: "http://localhost:3000/api/auth",
			NODE_ENV: "production",
			PUBLIC_APP_BASE_URL: "http://localhost:3000",
			PUBLIC_BOTS: undefined,
		},
		system(input) {
			const Schema = v.object({
				NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
			});
			return v.parse(Schema, input);
		},
		public(input) {
			const Schema = v.object({
				PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
				PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
			});
			return v.parse(Schema, input);
		},
		private(input) {
			const Schema = v.object({
				AUTH_URL: v.pipe(v.string(), v.url()),
			});
			return v.parse(Schema, input);
		},
	});

	assert.equal(env, {
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
		system(input) {
			const Schema = v.object({
				NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
			});
			return v.parse(Schema, input);
		},
		public(input) {
			const Schema = v.object({
				NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
				NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
			});
			return v.parse(Schema, input);
		},
		private(input) {
			const Schema = v.object({
				AUTH_URL: v.pipe(v.string(), v.url()),
			});
			return v.parse(Schema, input);
		},
	});

	assert.equal(env, {
		AUTH_URL: "http://localhost:3000/api/auth",
		NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
		NEXT_PUBLIC_BOTS: "disabled",
		NODE_ENV: "production",
	});
});

test.run();
