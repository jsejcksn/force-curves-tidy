import { parse as _csv_parse } from "https://deno.land/std@0.212.0/csv/parse.ts";
import { stringify as _csv_stringify } from "https://deno.land/std@0.212.0/csv/stringify.ts";

export const csv = {
	parse: _csv_parse,
	stringify: _csv_stringify,
} as const;

import type { ParsedPath as _path_ParsedPath } from "https://deno.land/std@0.212.0/path/_interface.ts";
// import { format as _path_format } from "https://deno.land/std@0.212.0/path/format.ts";
import { fromFileUrl as _path_fromFileUrl } from "https://deno.land/std@0.212.0/path/from_file_url.ts";
import { join as _path_join } from "https://deno.land/std@0.212.0/path/join.ts";
import { parse as _path_parse } from "https://deno.land/std@0.212.0/path/parse.ts";
import { relative as _path_relative } from "https://deno.land/std@0.212.0/path/relative.ts";
import { SEP as _path_SEP } from "https://deno.land/std@0.212.0/path/separator.ts";

export const path = {
	// format: _path_format,
	fromFileUrl: _path_fromFileUrl,
	join: _path_join,
	parse: _path_parse,
	relative: _path_relative,
	SEP: _path_SEP,
} as const;

// deno-lint-ignore no-namespace
export namespace path {
	export type ParsedPath = _path_ParsedPath;
}
