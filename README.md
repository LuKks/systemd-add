# systemd-add

Create system services easily

```
npm i systemd-add
```

## Usage

```sh
Usage: systemd-add <name> <command> [options]

Arguments:
  name                       service name
  command                    command to execute

Options:
  -V, --version              output the version number
  -m, --manager <type>       system or user
  --after <targets...>
  -e, --env <vars...>        environment variables
  -u, --user <user>          user to run as
  -g, --group <group>        group to run as
  -c, --cwd <dir>            working directory
  --restart <policy>
  -o, --option <options...>  service options
  --quiet                    supress output
  -h, --help                 display help for command
```

It uses your current working directory by default.

For example:

```sh
cd some-http-backend
systemd-add http-backend "node app.js" -e "PORT=1337"
```

Another example:

```sh
systemd-add http-backend "node app.js" -u ubuntu -o "StartLimitBurst=5"
```

## License

MIT
