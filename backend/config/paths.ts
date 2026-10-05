import path from "path";
import fs from "fs";

function findBackendRoot(startDir: string): string {
	let dir = path.resolve(startDir);

	for (let i = 0; i < 8; i++) {
		if (fs.existsSync(path.join(dir, "package.json"))) {
			return dir;
		}

		const parent = path.dirname(dir);

		if (parent === dir) break;

		dir = parent;
	}

	return process.cwd();
}

export const backendRoot = findBackendRoot(__dirname);

export const publicDir = path.join(backendRoot, "public");

export const audioDir = path.join(publicDir, "audio");
