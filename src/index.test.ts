import { suite } from "uvu";
import * as assert from "uvu/assert";
import * as v from "valibot";

import { createEnv } from "./index.js";

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
		shared(input) {
			const Schema = v.object({
				NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
			});
			return v.parse(Schema, input);
		},
		client(input) {
			const Schema = v.object({
				NEXT_PUBLIC_APP_BASE_URL: v.string([v.url()]),
				NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
			});
			return v.parse(Schema, input);
		},
		server(input) {
			const Schema = v.object({
				AUTH_URL: v.string([v.url()]),
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
			shared(input) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});
				return v.parse(Schema, input);
			},
			client(input) {
				const Schema = v.object({
					NEXT_PUBLIC_APP_BASE_URL: v.string([v.url()]),
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});
				return v.parse(Schema, input);
			},
			server(input) {
				const Schema = v.object({
					AUTH_URL: v.string([v.url()]),
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
			shared(input) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});
				return v.parse(Schema, input);
			},
			client(input) {
				const Schema = v.object({
					NEXT_PUBLIC_APP_BASE_URL: v.string([v.url()]),
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});
				return v.parse(Schema, input);
			},
			server(input) {
				const Schema = v.object({
					AUTH_URL: v.string([v.url()]),
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
			shared(input) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});
				return v.parse(Schema, input);
			},
			// @ts-expect-error Client-side environment variables must be prefixed.
			client(input) {
				const Schema = v.object({
					AUTH_URL: v.string([v.url()]),
					NEXT_PUBLIC_APP_BASE_URL: v.string([v.url()]),
				});
				return v.parse(Schema, input);
			},
			// @ts-expect-error Server-side environment variables must not be prefixed.
			server(input) {
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
			shared(input) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});
				return v.parse(Schema, input);
			},
			client(input) {
				const Schema = v.object({
					NEXT_PUBLIC_APP_BASE_URL: v.string([v.url()]),
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});
				return v.parse(Schema, input);
			},
			server(input) {
				const Schema = v.object({
					AUTH_URL: v.string([v.url()]),
				});
				return v.parse(Schema, input);
			},
		});

	assert.throws(env, /Invalid type: Expected "disabled" \| "enabled" but received "yes"/);
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
			shared(input) {
				const Schema = v.object({
					NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
				});
				return v.parse(Schema, input);
			},
			client(input) {
				const Schema = v.object({
					NEXT_PUBLIC_APP_BASE_URL: v.string([v.url()]),
					NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				});
				return v.parse(Schema, input);
			},
			server(input) {
				const Schema = v.object({
					AUTH_URL: v.string([v.url()]),
				});
				return v.parse(Schema, input);
			},
			onError(error) {
				if (error instanceof v.ValiError) {
					throw new Error(
						`❌ Invalid environment variables:\n${JSON.stringify(v.flatten(error).nested)}`,
					);
				}

				throw error;
			},
		});

	assert.throws(
		env,
		/Invalid environment variables:\n{"NEXT_PUBLIC_BOTS":\["Invalid type: Expected \\"disabled\\" \| \\"enabled\\" but received \\"yes\\""]}/,
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
		shared(input) {
			const Schema = v.object({
				NODE_ENV: v.optional(v.picklist(["development", "production"]), "development"),
			});
			return v.parse(Schema, input);
		},
		client(input) {
			const Schema = v.object({
				NEXT_PUBLIC_APP_BASE_URL: v.string([v.url()]),
				NEXT_PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
			});
			return v.parse(Schema, input);
		},
		server(input) {
			const Schema = v.object({
				AUTH_URL: v.string([v.url()]),
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

test.run();
