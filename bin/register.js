#!/usr/bin/env node

import minimist from 'minimist';
import path from 'path';
import usage from 'cli-usage';
import shell from 'shelljs';
import { white, bold, red, green, magenta } from 'chalk';
import _ from 'lodash';
import jsonfile from 'jsonfile';

// Input params
const argv = minimist(process.argv.slice(2));

const PATHS = {
  npm: {
    json: 'package.json',
    install: 'npm install',
  },
  modules: {
    manifest: 'manifest.json',
    inventory: 'dashboard.json',
  },
};

usage('../docs/usage.md');

// Validate package.json upfront since we need it for several things
let pkg;
const jsonPath = path.resolve(__dirname, path.join('..', PATHS.npm.json));

try {
  pkg = jsonfile.readFileSync(jsonPath, 'utf8');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(red(`Could not locate ${bold.white(PATHS.npm.json)}.`));
  } else {
    throw error;
  }

  process.exit(1);
}


// Output version
if (argv.v || argv.version) {
  if (typeof pkg.version !== 'undefined') {
    console.log(
      magenta('Dashboard Module Registration ') +  white(`v${pkg.version}`)
    );
    process.exit(0);
  } else {
    console.error(
      red(`Version not found. Please verify that your ${bold.white(PATHS.npm.json)} is properly formatted.`)
    );
    process.exit(1);
  }
}


// Install package
let manifest;
const dashModule = argv._[0];
if (typeof dashModule !== 'undefined') {
  shell.exec(PATHS.npm.install + ' ' + dashModule);

  // Check if module manifest exists
  try {
    manifest = require(PATHS.modules.manifest);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error(red(`Could not find ${white(PATHS.modules.manifest)}.`));
      process.exit(1);
    }
  }

  // Verify that manifest is valid (break this out into a package so it can be used by the modules)
  if (!isValidManifest(manifest)) {
    console.error(red(`Could not process ${white(PATHS.modules.manifest)}.`));
    process.exit(1);
  }

} else {
  console.log(white('No module to install.'));
  process.exit(1);
}


// Get inventory file data
const inventoryPath = path.join(process.cwd(), PATHS.modules.inventory);

try {
  const fileContent = jsonfile.readFileSync(inventoryPath, 'utf8');
  const installedModules = fileContent.modules;

  if (_.indexOf(installedModules, pkg.name) > -1) {
    console.log(white('Module already registered. No changes made.'));
    process.exit(0);
  }

  installedModules.push(pkg.name);
  fileContent.modules = installedModules;
  jsonfile.writeFileSync(inventoryPath, fileContent, { spaces: 2 });
  console.log(magenta(`Module ${white(pkg.name)} added to inventory`));

} catch(error) {
  if (error.code === 'ENOENT') {

    // Create the inventory file since it doesn't exist
    const newInventory = {
      modules: {},
    };

    newInventory.modules[manifest.id] = {
      "name": manifest.name,
      "roles": _.values(manifest.roles),
    };

    try {
      jsonfile.writeFileSync(inventoryPath, newInventory, { spaces: 2 });
      console.log(magenta('Module inventory file ' + white(PATHS.modules.inventory) + ' created!'));
    } catch(error) {
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