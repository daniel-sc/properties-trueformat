import { describe, it, expect } from 'bun:test';
import { parseProperties } from './propertiesParser';
import { PropertyEntry } from './model/propertyEntry';
import { PropertiesDocument } from './model/propertiesDocument';
import { CommentLine } from './model/commentLine';
import { BlankLine } from './model/blankLine';

describe('parseProperties', () => {
  it('should roundtrip simple property', () => {
    const input = 'username = alice\n';
    const doc = parseProperties(input);
    expect(doc.toString()).toBe(input);
  });

  it('should roundtrip comments and blank lines', () => {
    const input = '# This is a comment\r\n\n! Another comment\r\n   \r\n';
    const doc = parseProperties(input);
    expect(doc.toString()).toBe(input);
  });

  it('should roundtrip multiline property', () => {
    const input = 'description = Line1 \\\n    Line2 \\\n    Line3\n';
    const doc = parseProperties(input);
    expect(doc.toString()).toBe(input);
  });

  it('should roundtrip mixed content', () => {
    const input = '  key1: value1\r\n# comment for key2\r\nkey2 value2\r\n\nkey3=value3';
    const doc = parseProperties(input);
    expect(doc.toString()).toBe(input);
  });

  it('should parse empty value with separator', () => {
    const input = 'key=\n';
    const doc = parseProperties(input);

    expect(doc).toEqual(
      new PropertiesDocument([
        new PropertyEntry('', 'key', '=', [
          {
            indent: '',
            newline: '\n',
            text: '',
          },
        ]),
      ]),
    );
  });

  it('should parse empty value without separator', () => {
    const input = 'key\n';
    const doc = parseProperties(input);

    expect(doc).toEqual(
      new PropertiesDocument([
        new PropertyEntry('', 'key', '', [
          {
            indent: '',
            newline: '\n',
            text: '',
          },
        ]),
      ]),
    );
  });

  it('should handle no linebreak at the end', () => {
    const input = 'key=value';
    const doc = parseProperties(input);
    expect(doc).toEqual(
      new PropertiesDocument([
        new PropertyEntry('', 'key', '=', [
          {
            indent: '',
            newline: '',
            text: 'value',
          },
        ]),
      ]),
    );
  });

  it('should update property value', () => {
    const input = 'port=8080\n';
    const doc = parseProperties(input);
    const entry = doc.nodes.find((node) => node instanceof PropertyEntry);
    if (entry) {
      entry.valueSegments[0]!.text = '9090';
    }
    const output = doc.toString();
    expect(output).toBe('port=9090\n');
  });
  it('should parse readme example', () => {
    const input = `# Example configuration file
  ! comment with exclamation mark (indented)
key = value
key.subkey=without spaces around separator
  indented_key: indented value

key_after_blank_line = start \\
  of \\
  a multi-line value
`;
    const doc = parseProperties(input);
    expect(doc).toEqual(
      new PropertiesDocument([
        new CommentLine('', '#', ' Example configuration file', '\n'),
        new CommentLine('  ', '!', ' comment with exclamation mark (indented)', '\n'),
        new PropertyEntry('', 'key', ' = ', [{ indent: '', newline: '\n', text: 'value' }]),
        new PropertyEntry('', 'key.subkey', '=', [
          {
            indent: '',
            newline: '\n',
            text: 'without spaces around separator',
          },
        ]),
        new PropertyEntry('  ', 'indented_key', ': ', [{ indent: '', newline: '\n', text: 'indented value' }]),
        new BlankLine('', '\n'),
        new PropertyEntry('', 'key_after_blank_line', ' = ', [
          { indent: '', newline: '\\\n', text: 'start ' },
          { indent: '  ', newline: '\\\n', text: 'of ' },
          { indent: '  ', newline: '\n', text: 'a multi-line value' },
        ]),
      ]),
    );
  });
});
