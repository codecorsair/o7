export class I18n<T> extends GenericStore<T> {

  constructor (filePath: string) {
    super(resolve("./", "I18n", filePath));
  }

}