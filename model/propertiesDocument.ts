import type { BlankLine } from './blankLine.ts';
import type { CommentLine } from './commentLine.ts';
import type { PropertyEntry } from './propertyEntry.ts';

/**
 * A PropertiesDocument is a container for all parsed nodes.
 */
export class PropertiesDocument {
  constructor(public nodes: (BlankLine | CommentLine | PropertyEntry)[]) {}

  toString(): string {
    return this.nodes.map((node) => node.toString()).join('');
  }
}
