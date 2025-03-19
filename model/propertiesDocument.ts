import type { BlankLine } from './blankLine';
import type { CommentLine } from './commentLine';
import type { PropertyEntry } from './propertyEntry';

/**
 * A PropertiesDocument is a container for all parsed nodes.
 */
export class PropertiesDocument {
  constructor(public nodes: (BlankLine | CommentLine | PropertyEntry)[]) {}

  toString(): string {
    return this.nodes.map((node) => node.toString()).join('');
  }
}
