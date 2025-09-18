declare module 'badwords-ko' {
  export default class Filter {
    constructor();
    addWords(...words: string[]): void;
    clean(text: string): string;
    isProfane(text: string): boolean;
  }
}
