export class AssertionError extends Error {
	override readonly name = "AssertionError" as const;
}

export function assert<T>(
	expr: T,
	msgOrMsgFactory?: string | ((expr: T) => string) | undefined,
): asserts expr {
	if (!expr)
		throw new AssertionError(
			typeof msgOrMsgFactory === "function"
				? msgOrMsgFactory(expr)
				: msgOrMsgFactory,
		);
}

export class UnknownError extends Error {
	override readonly name = "UnknownError" as const;
}

export function toError(cause: unknown): Error {
	return cause instanceof Error
		? cause
		: new UnknownError('Found non-Error exception: see "cause" property', {
				cause,
		  });
}
