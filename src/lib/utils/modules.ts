import { Module, Client, CMProvider, ModuleDef } from '../types';
import { loadCommands } from './commands';
import { getFiles } from './getFiles';

export async function loadModules(directory: string, client: Client, cmp: CMProvider) {
  for await (const path of getFiles(directory, 0, 1, fileName => fileName.endsWith('index.js'))) {
    const m = require(path).default as Module;
    if (isValid(m, path)) {
      m.type = 'module';
      m.commands = {};
      m.modules = {};
      cmp.modules[m.name.toLowerCase()] = m;
      m.initialize(client);
      if (m.commandGroup) {
        m.commandGroup.forEach(a => cmp.commands[a.toLowerCase()] = m);
      }
      await loadModuleCommands(path.replace('index.js', 'commands'), m, cmp);
      await loadModules(path.replace('index.js', 'modules'), client, m.commandGroup ? m : client);
    }
  }
}

function isValid(module: ModuleDef, path: string) {
  if (!module.name || typeof module.name !== 'string') {
    console.error(`Invalid module at ${path}; 'name' is undefined or not a string.`);
    return false;
  }

  if (!module.initialize || typeof module.initialize !== 'function') {
    console.error(`Invalid module at ${path}; 'initialize' is undefined or not a function.`);
    return false;
  }

  if (!module.deleteGuildData || typeof module.deleteGuildData !== 'function') {
    console.error(`Invalid module at ${path}; 'deleteGuildData' is undefined or not a function.`);
    return false;
  }

  if (!module.deleteUserData || typeof module.deleteUserData !== 'function') {
    console.error(`Invalid module at ${path}; 'deleteUserData' is undefined or not a function.`);
    return false;
  }
  return true;
}

async function loadModuleCommands(directory: string, module: Module, cmp: CMProvider) {
  if (module.commandGroup) {
    // commands will be stored in the module itself;
    loadCommands(directory, module);
  } else {
    loadCommands(directory, cmp);
  }
}
