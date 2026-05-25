#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { apply } from './apply.js';

const program = new Command();

program
  .name('swayloop-standards')
  .description('Apply swayloop shared configs (tsconfig/eslint/prettier) to a project')
  .version('0.0.0');

program
  .command('apply')
  .description('Install Tier 1 packages and write/update config files')
  .option('--dry-run', 'preview changes without writing files')
  .option('--cwd <path>', 'target directory (default: process.cwd())')
  .option('--no-install', 'skip dependency installation')
  .action(
    async (options: { dryRun?: boolean; cwd?: string; install?: boolean }) => {
      try {
        await apply({
          cwd: options.cwd ?? process.cwd(),
          dryRun: options.dryRun ?? false,
          install: options.install !== false,
        });
      } catch (err) {
        console.error(
          chalk.red('apply failed:'),
          err instanceof Error ? err.message : err,
        );
        process.exit(1);
      }
    },
  );

await program.parseAsync();
