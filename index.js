const os = require('os')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

module.exports = class Systemd {
  static async add (name, command, opts = {}) {
    if (!name) throw new Error('Name is required')
    if (!command) throw new Error('Command is required')

    const manager = !opts.manager || opts.manager === 'system' ? 'system' : 'user'
    const dir = manager === 'system' ? '/etc/systemd/system' : (os.homedir() + '/.config/systemd/user')

    const after = ['syslog.target', 'network.target', 'nss-lookup.target', 'remote-fs.target']
    const options = []

    if (opts.after) {
      for (const target of opts.after) {
        after.push(target)
      }
    }

    if (opts.env) {
      for (const env of opts.env) {
        options.push('Environment=' + env)
      }
    }

    if (opts.user) options.push('User=' + opts.user)
    if (opts.group) options.push('Group=' + opts.group)

    options.push('WorkingDirectory=' + path.resolve(opts.cwd || '.'))

    options.push('RestartSec=1')
    options.push('Restart=' + opts.restart || 'always')

    if (opts.option) {
      for (const opt of opts.option) {
        options.push(opt)
      }
    }

    const service = `
[Unit]
After=${after.join(' ')}

[Service]
ExecStart=${command}
ExecStop=/bin/kill -s TERM $MAINPID
ExecReload=/bin/kill -s HUP $MAINPID
${options.join('\n')}

[Install]
WantedBy=multi-user.target
`.trim() + '\n'

    const filename = dir + '/' + name + '.service'

    if (manager === 'user') {
      await fs.promises.mkdir(path.dirname(filename), { recursive: true })
    }

    await fs.promises.writeFile(filename, service)

    if (opts.verbose) {
      console.log('Service file:', filename)
    }

    await execute('systemctl --' + manager + ' enable ' + name + '.service', { verbose: opts.verbose })
    await execute('systemctl --' + manager + ' daemon-reload', { verbose: opts.verbose })
  }
}

function execute (command, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: opts.verbose ? 'inherit' : 'ignore' })

    child.on('close', function (code) {
      if (code === 0) resolve()
      else reject(new Error('Exit code: ' + code))
    })

    child.on('error', reject)
  })
}
