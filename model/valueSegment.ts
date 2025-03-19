/**
 * A segment of a property value.
 * Each physical line of a multi-line property is stored as a segment.
 */
export interface ValueSegment {
  indent: string;
  text: string;
  /** The newline character(s) at the end of the segment. This might include `\` for multi line values! */
  newline: string;
}
