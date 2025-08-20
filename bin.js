#!/usr/bin/env node

const fs = require('fs')
const minimist = require('minimist')
const systemd = require('./index.js')

const argv = minimist(process.argv.slice(2), {
  alias: {
    env: 'e',
    user: 'u',
    group: 'g',
    cwd: 'c',
    option: 'o'
  }
})

main().catch(err => {
  console.error(err)
  process.exit(1)
})

async function main () {
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

  await systemd.add(argv._[0], argv._[1], {
    manager: argv.manager,
    after: typeof argv.after === 'string' ? [argv.after] : argv.after,
    env: typeof argv.env === 'string' ? [argv.env] : argv.env,
    user: argv.user,
    group: argv.group,
    cwd: argv.cwd,
    restart: argv.restart,
    option: typeof argv.option === 'string' ? [argv.option] : argv.option,
    verbose: !argv.quiet
  })
}
