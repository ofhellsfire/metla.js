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
- traceable

## Installation

There are 2 installation options:
1. Traditional installation via `npm`
2. Binary package

### NPM

```
npm install metla.js
# or globally
npm install -g metla.js
```

### Binary Package

Go to [release](https://github.com/ofhellsfire/metla.js/releases) page and download binary for your platform. This option allows you to run **Metla** without **Node.js** installed on your system.

If you don't want to specify path before binary name when executing **Metla**, then put binary to any path from `${PATH}` (e.g. `/usr/local/bin`)

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

There are 4 levels where configuration may be specified (from the lowest precedence to the highest one):
1. Default configuration, comes with **Metla** (can't be changed, but you may not specify options if default config works for you)
1. `${HOME}/.config/metla.ini` - user default config in [ini](https://www.techopedia.com/definition/24302/ini-file) format
2. External user custom configuration in [ini](https://www.techopedia.com/definition/24302/ini-file) format
3. Command line options

Every next level overrides options defined at lower precedence level

`ini` configuration files can have the following options:

`path` - path for files search
`tmpl` - regular expression
`keep` - number of files to keep
`mode` - ordering mode
`log` - path to log file

## Examples

Show what will be deleted

```
$ ls /tmp/
text10.txt  text11.txt  text12.txt  text1.txt  text2.txt  text3.txt  text4.txt  text5.txt  text6.txt  text7.txt  text8.txt  text9.txt

# Order by last modification (the newest files are kept)
$ metla --path /tmp/ --log /tmp/metla.log --keep 3 --tmpl '.+[.]txt' --noop --mode lastmod 
2020-01-12T15:02:31.304Z [info] will delete '/tmp/text9.txt' file
2020-01-12T15:02:31.306Z [info] will delete '/tmp/text8.txt' file
2020-01-12T15:02:31.307Z [info] will delete '/tmp/text7.txt' file
2020-01-12T15:02:31.307Z [info] will delete '/tmp/text6.txt' file
2020-01-12T15:02:31.307Z [info] will delete '/tmp/text5.txt' file
2020-01-12T15:02:31.307Z [info] will delete '/tmp/text4.txt' file
2020-01-12T15:02:31.307Z [info] will delete '/tmp/text3.txt' file
2020-01-12T15:02:31.307Z [info] will delete '/tmp/text2.txt' file
2020-01-12T15:02:31.307Z [info] will delete '/tmp/text1.txt' file

# Order lexicographically
$ metla --path /tmp/ --log /tmp/metla.log --keep 3 --tmpl '.+[.]txt' --noop --mode lexorder
2020-01-12T15:02:21.310Z [info] will delete '/tmp/text6.txt' file
2020-01-12T15:02:21.312Z [info] will delete '/tmp/text5.txt' file
2020-01-12T15:02:21.312Z [info] will delete '/tmp/text4.txt' file
2020-01-12T15:02:21.312Z [info] will delete '/tmp/text3.txt' file
2020-01-12T15:02:21.313Z [info] will delete '/tmp/text2.txt' file
2020-01-12T15:02:21.313Z [info] will delete '/tmp/text12.txt' file
2020-01-12T15:02:21.313Z [info] will delete '/tmp/text11.txt' file
2020-01-12T15:02:21.313Z [info] will delete '/tmp/text10.txt' file
2020-01-12T15:02:21.313Z [info] will delete '/tmp/text1.txt' file
```

Delete files

```
# Create config if you don't want supply command line arguments every time
$ cat <<EOF | tee /tmp/metla.conf
path=/tmp/alala
log=/tmp/metla.log
keep=3
tmpl=.+[.]txt
EOF

# Delete by specifying confiuration from file
$ metla --conf /tmp/metla.conf
2020-01-12T15:39:40.958Z [info] file '/tmp/text8.txt' has been deleted
2020-01-12T15:39:40.961Z [info] file '/tmp/text7.txt' has been deleted
2020-01-12T15:39:40.962Z [info] file '/tmp/text6.txt' has been deleted
2020-01-12T15:39:40.962Z [info] file '/tmp/text5.txt' has been deleted
2020-01-12T15:39:40.962Z [info] file '/tmp/text4.txt' has been deleted
2020-01-12T15:39:40.962Z [info] file '/tmp/text3.txt' has been deleted
2020-01-12T15:39:40.962Z [info] file '/tmp/text9.txt' has been deleted
2020-01-12T15:39:40.962Z [info] file '/tmp/text2.txt' has been deleted
2020-01-12T15:39:40.962Z [info] file '/tmp/text1.txt' has been deleted

$ ls /tmp/
metla.conf  text10.txt  text11.txt  text12.txt
```

## Building Binaries

You can build binary for Linux/Windows and use **Metla** without installed **Node.js**. The binary size will be pretty large (around 40Mb) for such a simple tool, so keep it in mind.

```
# building binaries
npm install                 # install dependencies
npm run build-binaries
ls -lh bin/                 # list built binaries
```

## Motivation

From time to time there is a need to remove files based on different rules (lexicographically, creation or modification date) in order to prevent disk space bloating. Yes, it is possible to solve many of these problems by using **bash scripts** (for Linux) or **powershell scripts** (for Windows), but the main motivation was to gain a bit of experience in **Node.js** along with creating not so useless thing.

## License

MIT