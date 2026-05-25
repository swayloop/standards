import { access, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import chalk from 'chalk';

const TIER_1_PACKAGES = [
  '@swayloop/tsconfig-base',
  '@swayloop/prettier-config',
  '@swayloop/eslint-config',
];

const RUNTIME_PEERS = ['eslint', 'prettier', 'typescript'];

const ESLINT_CONFIG_DEFAULT = `import swayloopConfig from '@swayloop/eslint-config';

export default swayloopConfig;
`;

const TSCONFIG_DEFAULT = `{
  "extends": "@swayloop/tsconfig-base/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
`;

export interface ApplyOptions {
  cwd: string;
  dryRun: boolean;
  install: boolean;
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function readJson<T = unknown>(path: string): Promise<T> {
  const content = await readFile(path, 'utf8');
  return JSON.parse(content) as T;
}

async function writeJson(path: string, data: unknown): Promise<void> {
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function runCmd(cmd: string, args: string[], cwd: string): Promise<void> {
  return new Promise((res, rej) => {
    const child = spawn(cmd, args, { cwd, stdio: 'inherit' });
    child.on('close', (code) =>
      code === 0
        ? res()
        : rej(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`)),
    );
  });
}

export async function apply(opts: ApplyOptions): Promise<void> {
  const { cwd, dryRun, install } = opts;
  const cwdAbs = resolve(cwd);

  console.log();
  console.log(
    chalk.bold(
      `Applying @swayloop/standards to ${chalk.cyan(cwdAbs)}${
        dryRun ? chalk.yellow(' (dry-run)') : ''
      }`,
    ),
  );
  console.log();

  const pkgJsonPath = join(cwdAbs, 'package.json');
  if (!(await exists(pkgJsonPath))) {
    throw new Error(`package.json not found at ${pkgJsonPath}`);
  }

  const pkg = await readJson<Record<string, unknown>>(pkgJsonPath);

  // 1. Install Tier 1 + peers
  if (install) {
    const toInstall = [...TIER_1_PACKAGES, ...RUNTIME_PEERS];
    const args = ['add', '-D', ...toInstall];
    console.log(
      `  ${dryRun ? chalk.yellow('would run') : chalk.green('run     ')} pnpm ${args.join(' ')}`,
    );
    if (!dryRun) {
      await runCmd('pnpm', args, cwdAbs);
    }
  } else {
    console.log(`  ${chalk.dim('skip    ')} dependency install (--no-install)`);
  }

  // 2. tsconfig.json
  const tsconfigPath = join(cwdAbs, 'tsconfig.json');
  if (await exists(tsconfigPath)) {
    const ts = await readJson<{ extends?: string | string[] }>(tsconfigPath);
    const ext = Array.isArray(ts.extends)
      ? ts.extends
      : ts.extends
        ? [ts.extends]
        : [];
    if (ext.includes('@swayloop/tsconfig-base/base.json')) {
      console.log(
        `  ${chalk.dim('skip    ')} tsconfig.json (already extends @swayloop/tsconfig-base)`,
      );
    } else {
      console.log(
        `  ${chalk.yellow('hint    ')} tsconfig.json exists. Add ${chalk.cyan(
          '"extends": "@swayloop/tsconfig-base/base.json"',
        )} manually.`,
      );
    }
  } else {
    console.log(
      `  ${dryRun ? chalk.yellow('would create') : chalk.green('create  ')} tsconfig.json`,
    );
    if (!dryRun) {
      await writeFile(tsconfigPath, TSCONFIG_DEFAULT, 'utf8');
    }
  }

  // 3. eslint.config.js
  const eslintPath = join(cwdAbs, 'eslint.config.js');
  if (await exists(eslintPath)) {
    console.log(
      `  ${chalk.dim('skip    ')} eslint.config.js (already exists)`,
    );
  } else {
    console.log(
      `  ${dryRun ? chalk.yellow('would create') : chalk.green('create  ')} eslint.config.js`,
    );
    if (!dryRun) {
      await writeFile(eslintPath, ESLINT_CONFIG_DEFAULT, 'utf8');
    }
  }

  // 4. package.json prettier field
  if (pkg.prettier === '@swayloop/prettier-config') {
    console.log(
      `  ${chalk.dim('skip    ')} package.json prettier field (already set)`,
    );
  } else {
    console.log(
      `  ${dryRun ? chalk.yellow('would patch') : chalk.green('patch   ')} package.json prettier = "@swayloop/prettier-config"`,
    );
    if (!dryRun) {
      pkg.prettier = '@swayloop/prettier-config';
      await writeJson(pkgJsonPath, pkg);
    }
  }

  // 5. Warn about existing .prettierrc*
  const prettierrcVariants = [
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.js',
    '.prettierrc.cjs',
    '.prettierrc.yaml',
    '.prettierrc.yml',
  ];
  const found = await Promise.all(
    prettierrcVariants.map(async (f) =>
      (await exists(join(cwdAbs, f))) ? f : null,
    ),
  );
  const existing = found.filter((f): f is string => f !== null);
  if (existing.length > 0) {
    console.log(
      `  ${chalk.yellow('warn    ')} existing ${existing.join(
        ', ',
      )} may override the package.json prettier field. Consider removing.`,
    );
  }

  console.log();
  console.log(
    dryRun
      ? chalk.yellow('Dry-run complete. No files changed.')
      : chalk.green('Done.'),
  );
  console.log();
}
