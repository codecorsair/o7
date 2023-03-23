import * as fs from "fs";
import { createLogger } from "./utils/logger";

const logger = createLogger();

export class GenericStore<T> {

  private filePath: string;
  private value: T;
  protected get Value(): T {
    return this.value;
  }
  protected set Value(value: T) {
    this.value = value;
    this.save();
  }

  constructor(filePath: string) {
    this.filePath = filePath;
    this.value = {} as T;

    this.load();
  }

  save(): void {
    try {
      const data = JSON.stringify(this.value, null, 2);
      fs.writeFileSync(this.filePath, data);
    } catch (error) {
      logger.error(`Failed to save config file: ${this.filePath} (${error.message})`);
    }
  }

  load(): void {
    if (!fs.existsSync(this.filePath)) {
      return;
    }

    try {
      const data = fs.readFileSync(this.filePath, "utf8");
      this.value = JSON.parse(data);
    } catch (error) {
      logger.error(`Failed to load config file: ${this.filePath} (${error.message})`);
    }
  }
}