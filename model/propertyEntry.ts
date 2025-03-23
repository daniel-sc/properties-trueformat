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

  /**
   * Returns the text value of the property entry.
   * This is the concatenation of all value segments.
   * Any escape sequences are unescaped.
   */
  getText(): string {
    return this.unescape(this.valueSegments.map((s) => s.text).join(''));
  }

  /**
   * Sets the text value of the property entry.
   * This will replace all existing value segments.
   * If `escapeUnicode` is true, any unicode character will be escaped.
   * Newlines, tabs and backslashes (and spaces at the beginning of a line) are always escaped.
   */
  setText(text: string, escapeUnicode: boolean, newLine = '\n'): void {
    const escaped = text
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/^ /g, '\\ ');
    this.valueSegments = [
      {
        indent: '',
        text: escapeUnicode ? this.escapeUnicode(escaped) : escaped,
        newline: newLine,
      },
    ];
  }

  private unescape(s: string): string {
    return s
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      )
      .replace(/\\\\/g, '\\')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\ /g, ' ');
  }

  private escapeUnicode(text: string) {
    return text.replace(
      /[\u007F-\uFFFF]/g,
      (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'),
    );
  }
}
