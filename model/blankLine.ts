import type { PropertyNode } from './propertyNode.ts';

/**
 * A blank line node (which may contain whitespace).
 */
export class BlankLine implements PropertyNode {
  constructor(
    public text: string,
    public newline: string,
  ) {}

  toString(): string {
    return this.text + this.newline;
  }
}
