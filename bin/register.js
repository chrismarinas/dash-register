#!/usr/bin/env node
'use strict';

var path = require('path'),
    argv = require('minimist')(process.argv.slice(2)),
    usage = require('cli-usage'),
    shell = require('shelljs'),
    chalk = require('chalk');

usage('../docs/usage.md');

if (argv.v || argv.version) {
  var pkg = require(path.resolve(__dirname, '../package.json'));
  console.log(chalk.green('Dashboard Module Registration') + chalk.white(' v' + pkg.version));
  process.exit(0);
}

var dashModule = argv._[0];

// install package
if (typeof dashModule !== 'undefined') {
  shell.exec('npm install ' + dashModule);
} else {
  console.log(chalk.white('No module to install.'));
}

let relativePath = path.relative(__dirname, process.cwd());

console.log(relativePath);

// generate inventory file, if it doesn't exist

// update inventory file with data from manifest

// register with auth

// build any necessary assets