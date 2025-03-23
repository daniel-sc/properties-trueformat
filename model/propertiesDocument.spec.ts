import { describe, expect, it } from 'bun:test';
import { PropertiesDocument } from './propertiesDocument';
import { PropertyEntry } from './propertyEntry';
import { BlankLine } from './blankLine';

describe('PropertiesDocument', () => {
  describe('toString', () => {
    it('should return empty string for empty document', () => {
      const document = new PropertiesDocument([]);
      expect(document.toString()).toBe('');
    });
    it('should return concatenated string of all nodes', () => {
      const document = new PropertiesDocument([
        new PropertyEntry('  ', 'key1', ': ', [{ indent: '', text: 'value', newline: '\n' }]),
        new PropertyEntry('  ', 'key2', '=', [{ indent: '', text: 'value', newline: '\n' }]),
      ]);
      expect(document.toString()).toBe('  key1: value\n  key2=value\n');
    });
    it('should not add a newline for the last entry', () => {
      const document = new PropertiesDocument([
        new PropertyEntry('  ', 'key1', ': ', [{ indent: '', text: 'value', newline: '\n' }]),
        new PropertyEntry('  ', 'key2', '=', [{ indent: '', text: 'value', newline: '' }]),
      ]);
      expect(document.toString()).toBe('  key1: value\n  key2=value');
    });
    it('should add a newline between any entries that are missing one', () => {
      // this could happen if the user manually edits the document
      const document = new PropertiesDocument([
        new PropertyEntry('  ', 'key1', ': ', [{ indent: '', text: 'value', newline: '\n' }]),
        new PropertyEntry('  ', 'key2', '=', [{ indent: '', text: 'value', newline: '' }]),
        new PropertyEntry('  ', 'key3', '=', [{ indent: '', text: 'value', newline: '\n' }]),
      ]);
      expect(document.toString()).toBe('  key1: value\n  key2=value\n  key3=value\n');
    });
    it('should handle entry without value segment', () => {
      const document = new PropertiesDocument([new PropertyEntry('  ', 'key', ': ', [])]);
      expect(document.toString()).toBe('  key: ');
    });
  });
  describe('guessDefaults', () => {
    it('should return default separator and newline for empty document', () => {
      const document = new PropertiesDocument([]);
      expect(document.guessDefaults()).toEqual({
        separator: ': ',
        newLine: '\n',
        escapedUnicode: true,
      });
    });
    it('should return default newline for single entry without newline', () => {
      const document = new PropertiesDocument([
        new PropertyEntry('  ', 'key', ': ', [{ indent: '', text: 'value', newline: '' }]),
      ]);
      expect(document.guessDefaults()).toEqual({
        separator: ': ',
        newLine: '\n',
        escapedUnicode: true,
      });
    });
    it('should return newline and separator from the majority of entries', () => {
      const document = new PropertiesDocument([
        new PropertyEntry('  ', 'key1', ': ', [{ indent: '', text: 'value', newline: '\n' }]),
        new PropertyEntry('  ', 'key2', '=', [{ indent: '', text: 'value', newline: '\r\n' }]),
        new PropertyEntry('  ', 'key3', '=', [{ indent: '', text: 'value', newline: '\r\n' }]),
      ]);
      expect(document.guessDefaults()).toEqual({
        separator: '=',
        newLine: '\r\n',
        escapedUnicode: true,
      });
    });
    it('should return newline from blank lines', () => {
      const document = new PropertiesDocument([new BlankLine('', '\r\n')]);
      expect(document.guessDefaults()).toEqual({
        separator: ': ',
        newLine: '\r\n',
        escapedUnicode: true,
      });
    });
    it('should return unicodeEncoded=true for encoded chars', () => {
      const document = new PropertiesDocument([
        new PropertyEntry('  ', 'key4', '=', [{ indent: '', text: 'value with unicode: \\u3053', newline: '\n' }]),
      ]);
      expect(document.guessDefaults()).toEqual({
        separator: '=',
        newLine: '\n',
        escapedUnicode: true,
      });
    });
    it('should return unicodeEncoded=false for unencoded chars', () => {
      const document = new PropertiesDocument([
        new PropertyEntry('  ', 'key5', '=', [{ indent: '', text: 'value with unicode: こんにちは', newline: '\n' }]),
      ]);
      expect(document.guessDefaults()).toEqual({
        separator: '=',
        newLine: '\n',
        escapedUnicode: false,
      });
    });
    it('should return unicodeEncoded=true if neither encoded nor unencoded chars present', () => {
      const document = new PropertiesDocument([
        new PropertyEntry('', 'key', '=', [{ indent: '', text: 'value', newline: '\n' }]),
      ]);
      expect(document.guessDefaults()).toEqual({
        separator: '=',
        newLine: '\n',
        escapedUnicode: true,
      });
    });
  });
});
