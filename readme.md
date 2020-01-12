# Metla / metla.js

Remove Files By Regexp Template

**Metla** allows you to remove files by searching via regexp template.

Main features are:
- batch file deletion
- filtering file names by regexp
- ordering matched files by:
  - last modification datetime
  - lexicographically
- keeping *X* number of files that match template
- minimal flat dependencies (3 tiny modules)
- no operation (output what will be deleted only)
- configurable
- ready for CI or cronjobs

## Usage

```
$ ./metla --help
Usage: metla [options]

search and remove files by regexp

Options:
  -V, --version       output the version number
  -p, --path <path>   path for files search
  -t, --tmpl <regex>  regexp expression to match file names
  -k, --keep <num>    number of files to keep
  -m, --mode <mode>   matched files ordering mode, valid values are: lastmod, lexorder; lastmod orders by modification date, lexorder orders lexicographically; default: lastmod
  -c, --conf <conf>   path to configuration file
  -l, --log <log>     path where log file is created/appended
  -n, --noop          do not perform deletion, show only what will be deleted (default: false)
  -s, --silent        prevent logs from stdout (default: false)
  -v, --verbose       enable verbose mode (default: false)
  -h, --help          output usage information
```

## Configuration

TBD

## Examples

TBD

## Building Binaries

You can build binary for Linux/Windows and use **Metla** without installed **Node.js**. The binary size will be pretty large (around 40Mb) for such a simple tool, so keep it in mind.

```
# building binaries
npm install                 # install dependencies
npm run build-binaries
ls -lh bin/                 # list built binaries
```

## Motivation

From time to time there is a need to remove files based on different rules (lexicographically, creation or modification date) in order to prevent disk space bloating. Yes, it is possible to solve many of those problems by using **bash scripts** (for Linux) or **powershell scripts** (for Windows), but the main motivation was to gain a bit of experience in **node.js** along with creating not so useless thing.

## License

MIT