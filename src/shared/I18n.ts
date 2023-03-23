import { GenericStore } from "./GenericStore";

export class I18n<T> extends GenericStore<T> {

  constructor () {
    super("i18n.json");
  }

}