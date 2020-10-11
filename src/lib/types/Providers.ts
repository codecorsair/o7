import { Collection } from "discord.js";
import { Command, Module } from './'

export interface CommandProvider {
  commands: Collection<string, Command | Module>;
}

export interface ModuleProvider {
  modules: Collection<string, Module>;
}

export type CMProvider = CommandProvider & ModuleProvider;
