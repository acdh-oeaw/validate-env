import { ValidationError } from "./index.js";

type Input = Record<string, unknown>;

interface CreateEnvParams<TPrivate extends Input> {
	/**
	 * Receives the raw environment and returns the validated variables.
	 * Should throw a `ValidationError` when validation fails.
	 */
	schema: (environment: Input) => TPrivate;
	environment: Record<keyof NoInfer<TPrivate>, unknown>;
	validation?: "disabled" | "enabled" | "public";
}

/**
 * Validates runtime environment variables.
 *
 * @throws {ValidationError} when the provided schema fails validation.
 */
export function createEnv<TPrivate extends Input>({
	schema,
	environment,
	validation,
}: CreateEnvParams<TPrivate>): Readonly<TPrivate> {
	for (const [key, value] of Object.entries(environment)) {
		if (value === "") {
			environment[key as keyof typeof environment] = undefined;
		}
	}

	if (validation === "disabled" || validation === "public") {
		return Object.freeze(environment) as Readonly<TPrivate>;
	}

	return Object.freeze(schema(environment));
}

export { ValidationError };
