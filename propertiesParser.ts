import { CommentLine } from './model/commentLine';
import { BlankLine } from './model/blankLine';
import type { ValueSegment } from './model/valueSegment';
import { PropertyEntry } from './model/propertyEntry';
import { PropertiesDocument } from './model/propertiesDocument';

/**
 * Checks whether the given line ends with an unescaped backslash.
 * (An odd number of consecutive backslashes at the end indicates continuation.)
 */
function endsWithContinuation(line: string): boolean {
  let count = 0;
  for (let i = line.length - 1; i >= 0 && line[i] === '\\'; i--) {
    count++;
  }
  return count % 2 === 1;
}

/**
 * Splits the text into an array of objects containing:
 * - content: the line content without the newline,
 * - newline: the actual newline characters (if any).
 */
function splitLinesPreserveNewline(text: string): { content: string; newline: string }[] {
  const regex = /(.*?)(\r\n|\n|\r|$)/g;
  const lines: { content: string; newline: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    // Avoid an extra empty match at the end.
    if (match[0] === '') break;
    lines.push({ content: match[1]!, newline: match[2]! });
  }
  return lines;
}

/**
 * Parses the given .properties file text into a PropertiesDocument.
 * This parser preserves every detail of the formatting.
 */
export function parseProperties(text: string): PropertiesDocument {
  const physicalLines = splitLinesPreserveNewline(text);
  const nodes: (CommentLine | BlankLine | PropertyEntry)[] = [];
  let i = 0;

  while (i < physicalLines.length) {
    const line = physicalLines[i]!;

    // Blank line: preserve even if it contains whitespace.
    if (line.content.trim() === '') {
      nodes.push(new BlankLine(line.content, line.newline));
      i++;
      continue;
    }

    // Comment line: first non-whitespace char is '#' or '!'.
    if (line.content.trim().startsWith('#') || line.content.trim().startsWith('!')) {
      const m = line.content.match(/^(\s*)([#!])(.*)$/);
      if (m) {
        nodes.push(new CommentLine(m[1]!, m[2]!, m[3]!, line.newline));
      } else {
        nodes.push(new CommentLine('', '', line.content, line.newline));
      }
      i++;
      continue;
    }

    // Otherwise, it is a property entry.
    // A property entry might span multiple physical lines if it ends with a continuation marker.
    const entryLines: { content: string; newline: string }[] = [];
    // Collect one or more physical lines that belong to this property.
    while (i < physicalLines.length) {
      entryLines.push(physicalLines[i]!);
      // If the current line does not end with an unescaped backslash, we are done.
      if (!endsWithContinuation(physicalLines[i]!.content)) {
        i++;
        break;
      }
      i++;
    }

    // Process the first physical line to extract key and separator.
    const firstLine = entryLines[0]!.content;
    const indentMatch = firstLine.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1]! : '';
    const lineWithoutIndent = firstLine.slice(indent.length);

    // Parse the key: per Java properties, the key extends to the first unescaped
    // whitespace, '=' or ':'.
    let key = '';
    let pos = 0;
    while (pos < lineWithoutIndent.length) {
      const ch = lineWithoutIndent[pos];
      if (
        (ch === '=' || ch === ':' || ch === ' ' || ch === '\t') &&
        (pos === 0 || lineWithoutIndent[pos - 1] !== '\\')
      ) {
        break;
      }
      key += ch;
      pos++;
    }

    // Parse the separator.
    const sepStart = pos;
    while (pos < lineWithoutIndent.length && (lineWithoutIndent[pos] === ' ' || lineWithoutIndent[pos] === '\t')) {
      pos++;
    }
    if (pos < lineWithoutIndent.length && (lineWithoutIndent[pos] === '=' || lineWithoutIndent[pos] === ':')) {
      pos++; // include the separator character
      while (pos < lineWithoutIndent.length && (lineWithoutIndent[pos] === ' ' || lineWithoutIndent[pos] === '\t')) {
        pos++;
      }
    }
    const separator = lineWithoutIndent.slice(sepStart, pos);

    // The remainder of the first line is the first part of the value.
    const firstValue = lineWithoutIndent.slice(pos);

    // Build value segments from all physical lines.
    const segments: ValueSegment[] = [];
    // For the first line, use the parsed value portion.
    segments.push({
      indent: '', // no indent for the first segment (all part of the separator)
      text: entryLines.length === 1 ? firstValue : firstValue.slice(0, firstValue.length - 1),
      newline: entryLines.length === 1 ? entryLines[0]!.newline : `\\${entryLines[0]!.newline}`,
    });
    // For subsequent lines, use the entire line content.
    for (let j = 1; j < entryLines.length; j++) {
      const lineIndentMatch = entryLines[j]!.content.match(/^(\s*)/);
      const lineIndent = lineIndentMatch ? lineIndentMatch[1]! : '';
      const lineText = entryLines[j]!.content.substring(lineIndent.length);
      segments.push({
        indent: lineIndent,
        text: j === entryLines.length - 1 ? lineText : lineText.slice(0, lineText.length - 1),
        newline: j === entryLines.length - 1 ? entryLines[j]!.newline : `\\${entryLines[j]!.newline}`,
      });
    }

    nodes.push(new PropertyEntry(indent, key, separator, segments));
  }

  return new PropertiesDocument(nodes);
}
