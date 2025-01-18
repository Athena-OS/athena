import { token } from '../utils.mjs'

/**
 * TODO
 * - Blockquote
 * - Image
 * - Table
 */
export const markdown = [
  // Base color
  token('meta.paragraph.markdown', '#bccfcf'),

  // Code comments
  token('comment.block.html', '#48676A'),

  // Headers
  token('entity.name.section.markdown', '#ffdfee', 'bold'), // # punctuation
  token('punctuation.definition.heading.markdown', '#a8ffdb', 'bold'), // text

  // Code block
  token('markup.inline.raw.string.markdown', '#ff96aa'), // ` punctuation
  token('punctuation.definition.raw.markdown', '#ffdfee'), // text

  // Fenced code block (w/out syntax)
  token('markup.fenced_code.block.markdown', '#74A39D'),

  // Horizontal rule
  token('meta.separator.markdown', '#999EE1'),

  // Anchors
  token('meta.link.inline.markdown', '#9ceeeb'), // base anchor color
  token('markup.underline.link', '#a8ffefad', 'italic'), // link href
  token('meta.link.inline.markdown punctuation.definition.string', '#5af5f0'), // []

  // Anchor definitions
  token('constant.other.reference.link', '#9ceeeb'), // text
  token('meta.link.reference.def markup.underline.link', '#74A39D', 'italic'), // link href
  token('meta.link.reference.def punctuation.definition.constant', '#75fffaad'), // []

  // Lists
  token('punctuation.definition.list.begin', '#a8ffdbad'),

  // Bold
  token('markup.bold.markdown', '#74A39D', 'bold'),

  // Italic
  token('markup.italic.markdown', '#abdada', 'italic'),
  token('markup.italic.markdown punctuation.definition', '#abdada', 'italic'),
]
