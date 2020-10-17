import { Command, Module } from './'

export interface CommandProvider {
  commands: { [alias: string]: Command | Module; };
}

export interface ModuleProvider {
  modules: { [commandGroup: string]: Module};
}

export type CMProvider = CommandProvider & ModuleProvider;
