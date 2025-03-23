import { describe, expect, it } from 'bun:test';
import { PropertyEntry } from './propertyEntry';

describe('PropertyEntry', () => {
  describe('getText', () => {
    it('should return text for multi line segments', () => {
      const entry = new PropertyEntry('  ', 'key', ': ', [
        { indent: '', text: 'value', newline: '\\\n' },
        { indent: '  ', text: 'continued', newline: '\n' },
      ]);
      expect(entry.getText()).toBe('valuecontinued');
    });
    it('should return unescaped unicode text', () => {
      const entry = new PropertyEntry('  ', 'key', ': ', [
        {
          indent: '',
          text: 'value with japanese: \\u3053\\u3093\\u306b\\u3061\\u306f',
          newline: '\n',
        },
      ]);
      expect(entry.getText()).toBe('value with japanese: こんにちは');
    });
    it('should return unescaped backslash', () => {
      const entry = new PropertyEntry('  ', 'key', ': ', [{ indent: '', text: '\\\\', newline: '\n' }]);
      expect(entry.getText()).toBe('\\');
    });
    it('should return unescaped newline and tab', () => {
      const entry = new PropertyEntry('  ', 'key', ': ', [{ indent: '', text: '\\n\\t', newline: '\n' }]);
      expect(entry.getText()).toBe('\n\t');
    });
    it('should return unescaped whitespace', () => {
      const entry = new PropertyEntry('  ', 'key', ': ', [{ indent: '', text: '\\ ', newline: '\n' }]);
      expect(entry.getText()).toBe(' ');
    });
  });

  describe('setText', () => {
    it('should set text for a single line', () => {
      const entry = new PropertyEntry('  ', 'key', ': ', []);
      entry.setText('value', false);
      expect(entry.valueSegments).toEqual([{ indent: '', text: 'value', newline: '\n' }]);
    });
    it('should set text for a single line with escaping', () => {
      const entry = new PropertyEntry('  ', 'key', ': ', []);
      entry.setText('value with japanese: こんにちは', true);
      expect(entry.valueSegments).toEqual([
        {
          indent: '',
          text: 'value with japanese: \\u3053\\u3093\\u306b\\u3061\\u306f',
          newline: '\n',
        },
      ]);
    });
    it('should set text without escaping', () => {
      const entry = new PropertyEntry('  ', 'key', ': ', []);
      entry.setText('value with japanese: こんにちは', false);
      expect(entry.valueSegments).toEqual([{ indent: '', text: 'value with japanese: こんにちは', newline: '\n' }]);
    });
    it('should escape space, newline and tab with escapeUnicode=true', () => {
      const entry = new PropertyEntry('  ', 'key', ': ', []);
      entry.setText(' \n\t ', true);
      expect(entry.valueSegments).toEqual([{ indent: '', text: '\\ \\n\\t ', newline: '\n' }]);
    });
    it('should escape space, newline and tab with escapeUnicode=false', () => {
      const entry = new PropertyEntry('  ', 'key', ': ', []);
      entry.setText(' \n\t ', false);
      expect(entry.valueSegments).toEqual([{ indent: '', text: '\\ \\n\\t ', newline: '\n' }]);
    });
    it('should escape backslash', () => {
      const entry = new PropertyEntry('  ', 'key', ': ', []);
      entry.setText('\\', false);
      expect(entry.valueSegments).toEqual([{ indent: '', text: '\\\\', newline: '\n' }]);
    });
  });
});
