import { GenericStore } from "./GenericStore";
import { resolve } from "./utils/resolve";

export class GenericConfig<T> extends GenericStore<T> {

  private flattendValue: { [key: string]: any } = {};

  constructor (filePath: string) {
    super(resolve("./", "configs", filePath));
  }

  get <T>(key: string): T {
    if (!this.flattendValue || this.flattendValue.length === 0 || !this.flattendValue[key]) {
      this.flattendValue = this.flatten(this.Value);
    }
    return this.flattendValue[key] as T;
  }

  set (key: string, value: any): void {
    this.flattendValue[key] = value;
    this.Value = this.unflatten(this.flattendValue);
  }

  private flatten(data: T): { [key: string]: any } {
    const result: { [key: string]: any } = {};
    function recurse(cur: any, prop: string) {
      if (Object(cur) !== cur) {
        result[prop] = cur;
      } else if (Array.isArray(cur)) {
        let l = cur.length;
        for (let i = 0; i < l; i++) {
          recurse(cur[i], prop + "[" + i + "]");
        }
        if (l === 0) {
          result[prop] = [];
        }
      } else {
        let isEmpty = true;
        for (const p in cur) {
          isEmpty = false;
          recurse(cur[p], prop ? prop + "." + p : p);
        }
        if (isEmpty && prop) {
          result[prop] = {};
        }
      }
    }
    recurse(data, "");
    return result;
  }

  private unflatten(data: { [key: string]: any }): T {
    const regex = /\.?([^.\[\]]+)|\[(\d+)\]/g;
    const resultholder: { [key: string]: any } = {};
    for (const p in data) {
      let cur = resultholder;
      let prop = "";
      let m;
      while ((m = regex.exec(p))) {
        cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
        prop = m[2] || m[1];
      }
      cur[prop] = data[p];
    }
    return resultholder[""] || resultholder;
  }

}