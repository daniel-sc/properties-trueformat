import type { PropertyNode } from './propertyNode';

/**
 * A comment line node (e.g. lines starting with '#' or '!').
 */
export class CommentLine implements PropertyNode {
  constructor(
    public indent: string,
    public marker: string,
    public text: string,
    public newline: string,
  ) {}

  toString(): string {
    return this.indent + this.marker + this.text + this.newline;
  }
}
