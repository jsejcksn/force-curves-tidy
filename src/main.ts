import { assert, toError } from "./assert.ts";
import { parseRawCsv } from "./csv.ts";
import { path, csv } from "./deps.ts";
import { destDir, formatPathAsFileName, getName, sourceDir } from "./paths.ts";
import { iterateFiles } from "./utils.ts";

type BaseResult = {
	ok: boolean;
	pathIn: string;
};

type OkResult = BaseResult & {
	ok: true;
	pathOut: string;
};

type ErrResult = BaseResult & {
	ok: false;
	error: string;
};

function buildResultsJson(results: readonly (OkResult | ErrResult)[]): string {
	let json = "[\n";

	for (const r of results.toSorted(
		// Failures first, then by path
		(a, b) => Number(a.ok) - Number(b.ok) || a.pathIn.localeCompare(b.pathIn),
	)) {
		json += `	${JSON.stringify(r)},\n`;
	}

	return `${json.slice(0, -2)}\n]`;
}

async function main() {
	const results: (OkResult | ErrResult)[] = [];

	{
		const names = new Set<string>();
		for await (const entry of iterateFiles(sourceDir)) {
			const fsPath = entry.path;
			entry.path = path.relative(sourceDir, entry.path);
			const parsedPath = path.parse(entry.path);

			if (parsedPath.ext.toLowerCase() === ".csv") {
				try {
					const parsedRows = parseRawCsv(await Deno.readTextFile(fsPath));
					const name = getName(parsedPath, entry.path);
					assert(!names.has(name), () => `Duplicate name generated: "${name}`);
					names.add(name);

					const csvText = csv.stringify(
						parsedRows.map(({ force, displacement, judgement }) => ({
							force,
							displacement,
							judge: judgement === "OK" ? 0 : 1,
							name,
						})),
						{ columns: ["force", "displacement", "judge", "name"] },
					);

					const fileName = `${formatPathAsFileName(entry.path).slice(
						0,
						-4,
					)}.csv`;
					const csvFilePath = path.join(destDir, fileName);
					await Deno.writeTextFile(csvFilePath, csvText);

					results.push({
						ok: true,
						pathIn: entry.path,
						pathOut: fileName,
					});
				} catch (cause) {
					const error = toError(cause);
					results.push({
						ok: false,
						pathIn: entry.path,
						error: error.message,
					});
				}
			}
		}
	}

	await Deno.writeTextFile(
		path.join(destDir, "_results.json"),
		buildResultsJson(results),
	);

	console.log("done");
}

main();
