import { assert, AssertionError } from "./assert.ts";
import { csv } from "./deps.ts";

type ForceUnit = "gf";
type DisplacementUnit = "mm";

type Judgement = "OK" | "'+NG";
type Position = "--";

type TimeParts = Record<"hour" | "minute" | "second", number>;
type DateParts = Record<"year" | "month" | "dayOfMonth", number>;

type MaybeStringTransformer<T> = (str?: string | undefined) => T;

const toUnsignedInt: MaybeStringTransformer<number> = (str) => {
	assert(
		str && /^\d+$/.test(str),
		() => `Expected unsigned integer, found "${str}"`,
	);
	return Number(str);
};

const toFloat: MaybeStringTransformer<number> = (str) => {
	assert(
		str && /^\-?\d+(\.\d+)?$/.test(str),
		() => `Expected floating point number, found "${str}"`,
	);
	return Number(str);
};

const toForceUnit: MaybeStringTransformer<ForceUnit> = (str) => {
	assert(str && /^gf$/.test(str), () => `Expected "gf", found "${str}"`);
	return str as ForceUnit;
};

const toDisplacementUnit: MaybeStringTransformer<DisplacementUnit> = (str) => {
	assert(str && /^mm$/.test(str), () => `Expected "mm", found "${str}"`);
	return str as DisplacementUnit;
};

const toJudgement: MaybeStringTransformer<Judgement> = (str) => {
	assert(
		str && /^OK|'\+NG$/.test(str),
		() => `Expected one of: "OK", "'+NG". Found "${str}"`,
	);
	return str as Judgement;
};

const toPosition: MaybeStringTransformer<Position> = (str) => {
	assert(str && /^--$/.test(str), () => `Expected "--", found "${str}"`);
	return str as Position;
};

const toTimeParts: MaybeStringTransformer<TimeParts> = (str) => {
	assert(
		str && /^\d{1,2}:\d{2}:\d{2} [AP]M$/.test(str),
		() => `Expected time in format "h:mm:ss [AP]M", found "${str}"`,
	);
	let i = str.indexOf(":");
	let hour = Number(str.slice(0, i));
	i += 1;
	const minute = Number(str.slice(i, i + 2));
	i += 3;
	const second = Number(str.slice(i, i + 2));
	i += 3;
	const morning = str.slice(i, i + 1) === "A";
	if (morning) {
		if (hour === 12) hour = 0;
	} else if (hour < 12) hour += 12;
	return { hour, minute, second };
};

const toDateParts: MaybeStringTransformer<DateParts> = (str) => {
	assert(
		str && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str),
		() => `Expected date in format "m/d/yyyy", found "${str}"`,
	);
	const i0 = str.indexOf("/");
	const month = Number(str.slice(0, i0));
	const i1 = str.indexOf("/", i0 + 1);
	const dayOfMonth = Number(str.slice(i0 + 1, i1));
	const year = Number(str.slice(i1 + 1));
	return { year, month, dayOfMonth };
};

const rowData = [
	{
		header: "No.",
		key: "index",
		parse: toUnsignedInt,
	},
	{
		header: "Force",
		key: "force",
		parse: toFloat,
	},
	{
		header: "Unit",
		key: "forceUnit",
		parse: toForceUnit,
	},
	{
		header: "Displacement",
		key: "displacement",
		parse: toFloat,
	},
	{
		header: "Unit",
		key: "displacementUnit",
		parse: toDisplacementUnit,
	},
	{
		header: "Judge",
		key: "judgement",
		parse: toJudgement,
	},
	{
		header: "Position",
		key: "position",
		parse: toPosition,
	},
	{
		header: "Time",
		key: "time",
		parse: toTimeParts,
	},
	{
		header: "Date",
		key: "date",
		parse: toDateParts,
	},
] as const;

export type ParsedRow = {
	[T in (typeof rowData)[number] as T["key"]]: ReturnType<T["parse"]>;
};

export function parseRawCsv(csvText: string): ParsedRow[] {
	const rows = csv.parse(csvText);

	assert(
		rows.length >= 7,
		() => `Expected at least 7 rows, found ${rows.length}`,
	);

	const headersRowIndex = 5;

	for (let i = 0; i < rowData.length; i += 1) {
		// biome-ignore lint/style/noNonNullAssertion: for loop
		const expected = rowData[i]!.header;
		const actual = rows[headersRowIndex]?.[i];
		assert(
			actual === expected,
			() =>
				`Expected header "${expected}" at row ${headersRowIndex + 1} column ${
					i + 1
				}, found ${typeof actual === "string" ? `"${actual}"` : "<undefined>"}`,
		);
	}

	const rowSliceIndex = 6;

	return rows.slice(rowSliceIndex).map(
		(row, rowIndex) =>
			Object.fromEntries(
				rowData.map(({ key, parse }, colIndex) => {
					try {
						return [key, parse(row[colIndex])];
					} catch (cause) {
						throw new AssertionError(
							`Failed to parse value at row ${
								rowSliceIndex + rowIndex + 1
							} column ${colIndex + 1}: ${
								cause instanceof Error ? cause.message : `see "cause" property`
							}`,
							{ cause },
						);
					}
				}),
			) as ParsedRow,
	);
}
