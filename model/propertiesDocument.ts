import { BlankLine } from './blankLine';
import { CommentLine } from './commentLine';
import { PropertyEntry } from './propertyEntry';

/**
 * A PropertiesDocument is a container for all parsed nodes.
 */
export class PropertiesDocument {
  constructor(public nodes: (BlankLine | CommentLine | PropertyEntry)[]) {}

  toString(): string {
    const defaultsMemoized = () => {
      let defaults: ReturnType<PropertiesDocument['guessDefaults']> | null = null;
      return () => {
        if (!defaults) {
          defaults = this.guessDefaults();
        }
        return defaults;
      };
    };
    const defaults = defaultsMemoized();
    return this.nodes
      .map((node, index) => {
        const nodeString = node.toString();
        if (this.getNewline(node) === '' && index < this.nodes.length - 1) {
          return nodeString + defaults().newLine;
        }
        return nodeString;
      })
      .join('');
  }

  private getNewline(node: PropertyEntry | CommentLine | BlankLine): string {
    if (node instanceof PropertyEntry) {
      return node.valueSegments.length ? node.valueSegments[node.valueSegments.length - 1]!.newline : '';
    } else {
      return node.newline;
    }
  }

  /**
   * Guesses the default separator, newline characters, and whether unicode characters are escaped for the document.
   * This is done by counting the occurrences of each separator, newline, and checking for unicode encoding in the document.
   *
   * When a document is empty, the default separator is ': ', the newline is '\n' and escapedUnicode is true.
   */
  public guessDefaults(): {
    separator: string;
    newLine: string;
    escapedUnicode: boolean;
  } {
    const separatorCounts = new Map<string, number>();
    const newLineCounts = new Map<string, number>();
    let unicodeEncodedCount = 0;
    let unicodeUnencodedCount = 0;

    for (const node of this.nodes) {
      if (node instanceof PropertyEntry) {
        const separator = node.separator;
        separatorCounts.set(separator, (separatorCounts.get(separator) ?? 0) + 1);

        if (node.valueSegments.length) {
          const newLine = node.valueSegments[node.valueSegments.length - 1]!.newline;
          newLineCounts.set(newLine, (newLineCounts.get(newLine) ?? 0) + 1);

          // Check for unicode encoding in value segments
          for (const segment of node.valueSegments) {
            if (/\\u[0-9A-Fa-f]{4}/.test(segment.text)) {
              unicodeEncodedCount++;
            } else if (/[^\x00-\x7F]/.test(segment.text)) {
              unicodeUnencodedCount++;
            }
          }
        }
      } else {
        const newLine = node.newline;
        newLineCounts.set(newLine, (newLineCounts.get(newLine) ?? 0) + 1);
      }
    }

    const separator = this.getMostCommon(separatorCounts) ?? ': ';
    const newLine = this.getMostCommon(newLineCounts) || '\n';
    const escapedUnicode = unicodeEncodedCount >= unicodeUnencodedCount;
    return { separator, newLine, escapedUnicode };
  }

  private getMostCommon(counts: Map<string, number>): string | undefined {
    return counts.entries().reduce((mostCommon: [string, number] | null, current: [string, number]) => {
      return current[1] > (mostCommon?.[1] ?? 0) ? current : mostCommon;
    }, null)?.[0];
  }
}
