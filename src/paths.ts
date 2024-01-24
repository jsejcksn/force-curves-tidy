import { path } from "./deps.ts";

export const sourceDir = path.fromFileUrl(
	new URL(import.meta.resolve("../force_curves")),
);

export const destDir = path.fromFileUrl(
	new URL(import.meta.resolve("../data")),
);

export const excludedPaths = new Set(
	[
		["Cherry MX2A RGB Speed Silver", "Cherry_MX2A_RGB_Speed_Silver.csv"],
		[
			"Mekanisk Ultramarine V2",
			"Mekanisk_Ultramarine_V2_HighResoultionRaw.csv",
		],
		[
			"MODE Tomorrow Purple Prototype",
			"MODE_Tomorrow_Purple_Prototype_HighResolution.csv",
		],
	].map((parts) => path.join(...parts)),
);

export const irregularPaths: Record<
	string,
	(parsedPath: path.ParsedPath) => string
> = Object.fromEntries(
	(
		[
			[
				["BSUN Avocado Panda V2", "BSUN Avocado Panda V2.csv"],
				(parsed) => parsed.name.slice(0, 21),
			],
			[
				["BSUN Crystal Light Blue", "BSUN Crystal Light Blue.csv"],
				(parsed) => parsed.name.slice(0, 23),
			],
			[
				[
					"Domikey x Glove Chocolate Donut Pink",
					"Domikey x Glove Chocolate Donut Pink Raw Data CSv.csv",
				],
				(parsed) => parsed.name.slice(0, 36),
			],
			[
				[
					"Huano Pineapple",
					"Huano Pineapple 51000 Actuations Ra w Data CSV.csv",
				],
				(parsed) => parsed.name.slice(0, 32),
			],
			[
				["Keyfirst Bling Green", "Keyfirst Bling Green Data Construction.csv"],
				(parsed) => parsed.name.slice(0, 20),
			],
			[
				["KeyGeek Raw", "KeyGeek Raw Raw CSV.csv"],
				(parsed) => parsed.name.slice(0, 11),
			],
			[
				["LCET Sea Night", "LCET Sea Night Data CSV.csv"],
				(parsed) => parsed.name.slice(0, 14),
			],
			[
				[
					"SwitchOddities Spring Testers",
					"KTT 3 Stage",
					"SO Springs Linear Kelowna Progressive 45g Raw Data CSV.csv",
				],
				(parsed) =>
					`${parsed.name.slice(0, 41)} ${path.parse(parsed.dir).name}`,
			],
			[
				[
					"SwitchOddities Spring Testers",
					"KTT 3 Stage",
					"SO Springs Tactile Kelowna Progressive 45g Raw Data CSV.csv",
				],
				(parsed) =>
					`${parsed.name.slice(0, 42)} ${path.parse(parsed.dir).name}`,
			],
			[
				[
					"SwitchOddities Spring Testers",
					"TX XL",
					"SO Springs Linear TX XL 45g.csv",
				],
				(parsed) => parsed.name.slice(0, 27),
			],
			[
				[
					"SwitchOddities Spring Testers",
					"TX XL",
					"SO Springs Tactile TX XL 45g.csv",
				],
				(parsed) => parsed.name.slice(0, 28),
			],
		] satisfies [string[], (parsedPath: path.ParsedPath) => string][]
	).map(([parts, fn]) => [path.join(...parts), fn]),
);

export function getName(parsedPath: path.ParsedPath, fsPath: string): string {
	if (fsPath in irregularPaths) {
		// biome-ignore lint/style/noNonNullAssertion: Checked in conditional
		return irregularPaths[fsPath]!(parsedPath);
	}
	if (parsedPath.name.endsWith(" Raw Data CSV")) {
		return parsedPath.name.slice(0, -13).trim();
	}
	if (parsedPath.name.endsWith(" Raw Data")) {
		return parsedPath.name.slice(0, -9).trim();
	}
	throw new Error(`Unexpected file path pattern:\n${fsPath}`);
}

export function isRawCsvPath(
	parsedPath: path.ParsedPath,
	fsPath: string,
): boolean {
	return (
		parsedPath.ext.toLowerCase() === ".csv" &&
		!parsedPath.name.endsWith("HighResolutionRaw") &&
		!excludedPaths.has(fsPath)
	);
}

export function formatPathAsFileName(fsPath: string): string {
	return fsPath.replaceAll(path.SEP, "__");
}
