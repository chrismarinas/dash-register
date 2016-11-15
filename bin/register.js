#!/usr/bin/env node
'use strict';

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cliUsage = require('cli-usage');

var _cliUsage2 = _interopRequireDefault(_cliUsage);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _chalk = require('chalk');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _jsonfile = require('jsonfile');

var _jsonfile2 = _interopRequireDefault(_jsonfile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Input params
var argv = (0, _minimist2.default)(process.argv.slice(2));

var PATHS = {
  npm: {
    json: 'package.json',
    install: 'npm install'
  },
  modules: {
    manifest: 'manifest.json',
    inventory: 'dashboard.json'
  }
};

(0, _cliUsage2.default)('../docs/usage.md');

// Validate package.json upfront since we need it for several things
var pkg = void 0;
var jsonPath = _path2.default.resolve(__dirname, _path2.default.join('..', PATHS.npm.json));

try {
  pkg = _jsonfile2.default.readFileSync(jsonPath, 'utf8');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error((0, _chalk.red)('Could not locate ' + _chalk.bold.white(PATHS.npm.json) + '.'));
  } else {
    throw error;
  }

  process.exit(1);
}

// Output version
if (argv.v || argv.version) {
  if (typeof pkg.version !== 'undefined') {
    console.log((0, _chalk.magenta)('Dashboard Module Registration ') + (0, _chalk.white)('v' + pkg.version));
    process.exit(0);
  } else {
    console.error((0, _chalk.red)('Version not found. Please verify that your ' + _chalk.bold.white(PATHS.npm.json) + ' is properly formatted.'));
    process.exit(1);
  }
}

// Install package
var manifest = void 0;
var dashModule = argv._[0];
if (typeof dashModule !== 'undefined') {
  _shelljs2.default.exec(PATHS.npm.install + ' ' + dashModule);

  // Check if module manifest exists
  try {
    manifest = require(PATHS.modules.manifest);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error((0, _chalk.red)('Could not find ' + (0, _chalk.white)(PATHS.modules.manifest) + '.'));
      process.exit(1);
    }
  }

  // Verify that manifest is valid (break this out into a package so it can be used by the modules)
  if (!isValidManifest(manifest)) {
    console.error((0, _chalk.red)('Could not process ' + (0, _chalk.white)(PATHS.modules.manifest) + '.'));
    process.exit(1);
  }
} else {
  console.log((0, _chalk.white)('No module to install.'));
  process.exit(1);
}

// Get inventory file data
var inventoryPath = _path2.default.join(process.cwd(), PATHS.modules.inventory);

try {
  var fileContent = _jsonfile2.default.readFileSync(inventoryPath, 'utf8');
  var installedModules = fileContent.modules;

  if (_lodash2.default.indexOf(installedModules, pkg.name) > -1) {
    console.log((0, _chalk.white)('Module already registered. No changes made.'));
    process.exit(0);
  }

  installedModules.push(pkg.name);
  fileContent.modules = installedModules;
  _jsonfile2.default.writeFileSync(inventoryPath, fileContent, { spaces: 2 });
  console.log((0, _chalk.magenta)('Module ' + (0, _chalk.white)(pkg.name) + ' added to inventory'));
} catch (error) {
  if (error.code === 'ENOENT') {

    // Create the inventory file since it doesn't exist
    var newInventory = {
      modules: {}
    };

    newInventory.modules[manifest.id] = {
      "name": manifest.name,
      "roles": _lodash2.default.values(manifest.roles)
    };

    try {
      _jsonfile2.default.writeFileSync(inventoryPath, newInventory, { spaces: 2 });
      console.log((0, _chalk.magenta)('Module inventory file ' + (0, _chalk.white)(PATHS.modules.inventory) + ' created!'));
    } catch (error) {
      throw error;
    }
  }

  process.exit(0);
}

// Register with auth service
console.log('Permissions updated');

// HELPERS
function isValidManifest(manifest) {
  return true;
}