import type { PropertyNode } from './propertyNode';
import type { ValueSegment } from './valueSegment';

/**
 * A property entry node.
 * Stores the exact indent, key, separator (including surrounding spaces),
 * and an array of value segments (for multi-line values).
 */
export class PropertyEntry implements PropertyNode {
  constructor(
    public indent: string,
    public key: string,
    public separator: string,
    public valueSegments: ValueSegment[],
  ) {}

  toString(): string {
    let result = this.indent + this.key + this.separator;
    // Append any continuation segments.
    for (let i = 0; i < this.valueSegments.length; i++) {
      result +=
        this.valueSegments[i]!.indent +
        this.valueSegments[i]!.text +
        this.valueSegments[i]!.newline;
    }
    return result;
  }
}
