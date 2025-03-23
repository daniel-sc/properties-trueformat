import { BlankLine } from './blankLine';
import { CommentLine } from './commentLine';
import { PropertyEntry } from './propertyEntry';

/**
 * A PropertiesDocument is a container for all parsed nodes.
 */
export class PropertiesDocument {
  constructor(public nodes: (BlankLine | CommentLine | PropertyEntry)[]) {}

  toString(): string {
    const { newLine } = this.guessDefaults();
    return this.nodes
      .map((node, index) => {
        const nodeString = node.toString();
        if (
          node instanceof PropertyEntry &&
          node.valueSegments.length &&
          node.valueSegments[node.valueSegments.length - 1]?.newline === '' &&
          index < this.nodes.length - 1
        ) {
          return nodeString + newLine;
        }
        return nodeString;
      })
      .join('');
  }

  /**
   * Guesses the default separator and newline characters for the document.
   * This is done by counting the occurrences of each separator and newline in the document.
   */
  public guessDefaults(): { separator: string; newLine: string } {
    const separatorCounts = new Map<string, number>();
    const newLineCounts = new Map<string, number>();

    for (const node of this.nodes) {
      if (node instanceof PropertyEntry) {
        const separator = node.separator;
        separatorCounts.set(
          separator,
          (separatorCounts.get(separator) ?? 0) + 1,
        );

        if (node.valueSegments.length) {
          const newLine =
            node.valueSegments[node.valueSegments.length - 1]!.newline;
          newLineCounts.set(newLine, (newLineCounts.get(newLine) ?? 0) + 1);
        }
      } else {
        const newLine = node.newline;
        newLineCounts.set(newLine, (newLineCounts.get(newLine) ?? 0) + 1);
      }
    }

    const separator = this.getMostCommon(separatorCounts) ?? ': ';
    const newLine = this.getMostCommon(newLineCounts) || '\n';
    return { separator, newLine };
  }

  private getMostCommon(counts: Map<string, number>): string | undefined {
    return counts
      .entries()
      .reduce(
        (mostCommon: [string, number] | null, current: [string, number]) => {
          return current[1] > (mostCommon?.[1] ?? 0) ? current : mostCommon;
        },
        null,
      )?.[0];
  }
}
