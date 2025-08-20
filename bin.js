#!/usr/bin/env node

const fs = require('fs')
const { program } = require('commander')
const pkg = require('./package.json')
const systemd = require('./index.js')

const cli = program
  .version(pkg.version)
  .description(pkg.description)
  .argument('<name>', 'service name')
  .argument('<command>', 'command to execute')
  .option('-m, --manager <type>', 'system or user')
  .option('--after <targets...>')
  .option('-e, --env <vars...>', 'environment variables')
  .option('-u, --user <user>', 'user to run as')
  .option('-g, --group <group>', 'group to run as')
  .option('-c, --cwd <dir>', 'working directory')
  .option('--restart <policy>')
  .option('-o, --option <options...>', 'service options')
  .option('--quiet', 'supress output')
  .action(main)

cli.parseAsync().catch(err => {
  console.error('error: ' + err.message)
  process.exit(1)
})

async function main (name, command, opts) {
  try {
    await fs.promises.access('/etc/systemd/system')
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(err.message)
      process.exitCode = 1
      return
    }

    throw err
  }

  await systemd.add(name, command, {
    manager: opts.manager,
    after: typeof opts.after === 'string' ? [opts.after] : opts.after,
    env: typeof opts.env === 'string' ? [opts.env] : opts.env,
    user: opts.user,
    group: opts.group,
    cwd: opts.cwd,
    restart: opts.restart,
    option: typeof opts.option === 'string' ? [opts.option] : opts.option,
    verbose: !opts.quiet
  })
}
