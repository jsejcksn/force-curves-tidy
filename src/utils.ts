import { path } from "./deps.ts";

export type EntryWithPath = Deno.DirEntry & { path: string };
export type FileEntryWithPath = EntryWithPath & { isFile: true };

export async function* iterateFiles(
	dirPath: string,
): AsyncGenerator<FileEntryWithPath, void> {
	const stack: string[] = [dirPath];
	while (stack.length > 0) {
		// biome-ignore lint/style/noNonNullAssertion: Checked in conditional
		const dirPath = stack.shift()!;
		for await (const entry of Deno.readDir(dirPath)) {
			const fsPath = path.join(dirPath, entry.name);
			if (entry.isDirectory) {
				stack.push(fsPath);
				continue;
			}
			if (entry.isFile) {
				yield { ...entry, path: fsPath } as FileEntryWithPath;
			}
		}
	}
}
