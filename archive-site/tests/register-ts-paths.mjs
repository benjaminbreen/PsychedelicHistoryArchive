import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(import.meta.dirname, "..");

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const resolved = resolveProjectAlias(specifier);
      if (!resolved) {
        return nextResolve(specifier, context);
      }

      return nextResolve(resolved, context);
    }

    if (!specifier.startsWith(".") || !context.parentURL?.startsWith("file:")) {
      return nextResolve(specifier, context);
    }

    const resolved = resolveRelativeSpecifier(specifier, context.parentURL);
    if (!resolved) {
      return nextResolve(specifier, context);
    }

    return nextResolve(resolved, context);
  },
});

function resolveProjectAlias(specifier) {
  const relativePath = specifier.slice(2);
  const basePath = path.join(projectRoot, "src", relativePath);
  return pathToExistingModule(basePath);
}

function resolveRelativeSpecifier(specifier, parentUrl) {
  const parentDir = path.dirname(fileURLToPath(parentUrl));
  return pathToExistingModule(path.resolve(parentDir, specifier));
}

function pathToExistingModule(basePath) {
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.jsx`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
  ];
  const match = candidates.find((candidate) => existsSync(candidate));
  return match ? pathToFileURL(match).href : undefined;
}
