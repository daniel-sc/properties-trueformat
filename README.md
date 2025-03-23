[![npm](https://img.shields.io/npm/v/properties-trueformat)](https://www.npmjs.com/package/properties-trueformat)
[![Coverage Status](https://coveralls.io/repos/github/daniel-sc/properties-trueformat/badge.svg?branch=main)](https://coveralls.io/github/daniel-sc/properties-trueformat?branch=main)

# properties-trueformat

properties-trueformat is a TypeScript library for parsing, editing, and serializing Java .properties files without losing any formatting details.
It builds a custom AST that captures every nuance — comments, blank lines, indentation, and multi-line value continuations — ensuring a no-op round trip.

This library is inspired by the design of [xml-trueformat](https://github.com/daniel-sc/xml-trueformat) and is ideal for use cases where preserving the exact layout and comments of .properties files is critical (e.g., configuration files under version control).
Enjoy seamless, non-destructive editing of your Java properties files!

## Features

- **Exact Formatting Preservation** \
  Retains inline comments, blank lines, and all whitespace exactly as in the original file.

- **Multi-line Value Support** \
  Handles properties with multi-line values (using the backslash continuation) while preserving the exact line breaks and indents.

- **AST-based Editing** \
  Provides an Abstract Syntax Tree for precise modifications. Change a property’s value or add new entries without reformatting the rest of the file.

- **Text Escaping and Unescaping** \
  Automatically escapes and unescapes special characters (e.g., newlines, tabs, backslashes, and unicode characters) in property values.

- **Default Separator and Newline Guessing** \
  Automatically determines the most common separator and newline characters used in the document for consistent formatting.

## Installation

Install via npm:

```bash
npm install properties-trueformat
```

## Usage

Below is an example that reads a .properties file, updates a property, and writes it back without altering its formatting:

```ts
import {
  PropertiesDocument,
  PropertyEntry,
  parseProperties,
} from 'properties-trueformat';
import * as fs from 'fs';

// alternatively, read the file content from disk
const content = `# Example configuration file
  ! comment with exclamation mark (indented)
key = value
key.subkey=without spaces around separator
  indented_key: indented value

key_after_blank_line = start \\
  of \\
  a multi-line value
`;

// Parse into a structured AST
const doc: PropertiesDocument = parseProperties(content);

// this is the expected AST:
expect(doc).toEqual(
  new PropertiesDocument([
    new CommentLine('', '#', ' Example configuration file', '\n'),
    new CommentLine(
      '  ',
      '!',
      ' comment with exclamation mark (indented)',
      '\n',
    ),
    new PropertyEntry('', 'key', ' = ', [
      { indent: '', newline: '\n', text: 'value' },
    ]),
    new PropertyEntry('', 'key.subkey', '=', [
      { indent: '', newline: '\n', text: 'without spaces around separator' },
    ]),
    new PropertyEntry('  ', 'indented_key', ': ', [
      { indent: '', newline: '\n', text: 'indented value' },
    ]),
    new BlankLine('', '\n'),
    new PropertyEntry('', 'key_after_blank_line', ' = ', [
      { indent: '', newline: '\\\n', text: 'start ' },
      { indent: '  ', newline: '\\\n', text: 'of ' },
      { indent: '  ', newline: '\n', text: 'a multi-line value' },
    ]),
  ]),
);

// Find and update a property, e.g., change "username"
const entry = doc.nodes
  .filter((node) => node instanceof PropertyEntry)
  .find((node) => node.key === 'indented_key');
if (entry) {
  // Update the first segment of the value (for single-line properties)
  entry.valueSegments[0].text = 'updated value';
}

// Serialize back to string (format preserved)
const newContent = doc.toString();

expect(newContent).toEqual(`# Example configuration file
  ! comment with exclamation mark (indented)
key = value
key.subkey=without spaces around separator
  indented_key: updated value

key_after_blank_line = start \\
  of \\
  a multi-line value
`);
// you may write the new content back to disk
```

## Contributing

Contributions, bug reports, and feature requests are welcome!

Please open an issue or submit a pull request on the GitHub repository.
