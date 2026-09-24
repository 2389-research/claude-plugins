// ABOUTME: Renders a plugin README's markdown to the HTML its detail page shows
// ABOUTME: A small regex renderer for the subset of GitHub-flavoured markdown the READMEs use

// Convert markdown table to HTML
function convertMarkdownTable(tableText) {
  const lines = tableText.trim().split('\n');
  if (lines.length < 2) return tableText;

  // Parse row, handling leading/trailing pipes but preserving empty cells
  const parseRow = (row) => {
    // Remove leading/trailing pipes and split
    const trimmed = row.replace(/^\||\|$/g, '');
    return trimmed.split('|').map(cell => cell.trim());
  };

  // Parse header row
  const headerCells = parseRow(lines[0]);

  // Skip separator row (line with dashes)
  // Parse data rows
  const dataRows = lines.slice(2).map(parseRow);

  // The wrapper scrolls a wide table on its own so it can't widen a phone-width page.
  let html = '<div class="table-scroll"><table class="readme-table"><thead><tr>';
  headerCells.forEach(cell => {
    html += `<th>${cell}</th>`;
  });
  html += '</tr></thead><tbody>';

  dataRows.forEach(row => {
    html += '<tr>';
    row.forEach(cell => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  return html;
}

// Inside a paragraph a lone newline is a soft break, which the browser shows as a space. Only a
// line that ends in two or more spaces or a backslash is a hard break. The lookbehind tries a run
// of spaces from its first space only; trying it from every space costs time in the square of
// the run's length.
function hardBreaks(text) {
  return text.replace(/(?:(?<! ) {2,}|\\)\n/g, '<br>\n');
}

// Convert markdown to basic HTML
function markdownToHtml(md) {
  if (!md) return '';

  // Strip YAML front matter (--- ... ---)
  md = md.replace(/^---\n[\s\S]*?\n---\n/, '');

  // CRITICAL: Extract code blocks first and protect them from processing
  const codeBlocks = [];
  // Use [^\n`]* to capture language tags like objective-c, c++, etc.
  md = md.replace(/```([^\n`]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const index = codeBlocks.length;
    // Escape HTML entities in code
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    codeBlocks.push(`<pre><code class="language-${lang || ''}">${escapedCode}</code></pre>`);
    return `{{CODE_BLOCK_${index}}}`;
  });

  // Also protect inline code
  const inlineCode = [];
  md = md.replace(/`([^`]+)`/g, (match, code) => {
    const index = inlineCode.length;
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    inlineCode.push(`<code>${escapedCode}</code>`);
    return `{{INLINE_CODE_${index}}}`;
  });

  // Convert tables (before other processing). The match stops at the last row's closing pipe:
  // the newline after it belongs to the blank line that ends the table.
  md = md.replace(/^(\|.+\|)\n(\|[-:\s|]+\|)\n((?:\|.+\|\n)*\|.+\|)/gm, (match) => {
    return convertMarkdownTable(match);
  });

  // Headers
  md = md.replace(/^#{5,6} (.*$)/gm, '<h6>$1</h6>');
  md = md.replace(/^#### (.*$)/gm, '<h5>$1</h5>');
  md = md.replace(/^### (.*$)/gm, '<h4>$1</h4>');
  md = md.replace(/^## (.*$)/gm, '<h3>$1</h3>');
  md = md.replace(/^# (.*$)/gm, '<h2>$1</h2>');
  // A heading is a block of its own, even with no blank line before or after it
  md = md.replace(/^<h[2-6]>.*<\/h[2-6]>$/gm, '\n$&\n');

  // Blockquotes
  md = md.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
  md = md.replace(/<\/blockquote>\n<blockquote>/g, '\n');

  // Bold and italic. Neither runs past a blank line, since a paragraph ends there. A bold may
  // hold a single-star italic, so its content may hold a lone * but never **; the italic pass
  // then renders the inner pair.
  md = md.replace(/\*\*((?:[^*\n]|\n(?!\n)|\*(?!\*))+)\*\*/g, '<strong>$1</strong>');
  md = md.replace(/\*((?:[^*\n]|\n(?!\n))+)\*/g, '<em>$1</em>');

  // Links
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');

  // A list item may wrap onto indented lines below it. GFM reads those lines as part of the
  // item, so join them onto it. An indented line that starts with its own marker is a nested
  // item, not a continuation, and keeps its line.
  md = md.replace(/^([ \t]*(?:-|\d+\.) .*)((?:\n[ \t]+(?!(?:-|\d+\.) )\S.*)+)/gm,
    (match, item, rest) => item + rest.replace(/\n[ \t]+/g, ' '));

  // Task lists
  md = md.replace(/^- \[x\] (.*$)/gim, '{{TASK_DONE}}$1{{/TASK_DONE}}');
  md = md.replace(/^- \[ \] (.*$)/gm, '{{TASK}}$1{{/TASK}}');

  // Ordered lists
  md = md.replace(/^\d+\. (.*$)/gm, '{{OLI}}$1{{/OLI}}');

  // Unordered lists (including nested - handle indented items). Indentation is spaces or tabs
  // only: \s would also take the newlines of blank lines above a list and count them as depth.
  md = md.replace(/^([ \t]*)\- (.*$)/gm, (match, indent, content) => {
    const level = Math.floor(indent.length / 2); // 2 spaces = 1 level
    return `{{ULI:${level}}}${content}{{/ULI}}`;
  });

  // Convert list placeholders to HTML
  md = md.replace(/({{OLI}}[\s\S]*?{{\/OLI}}\n?)+/g, (match) => {
    const items = match.replace(/{{OLI}}([\s\S]*?){{\/OLI}}/g, '<li>$1</li>');
    return '<ol>' + items.trim() + '</ol>\n';
  });

  // Convert unordered lists with nesting support
  md = md.replace(/({{ULI:\d+}}[\s\S]*?{{\/ULI}}\n?)+/g, (match) => {
    let html = '';
    let currentLevel = 0;
    const lines = match.trim().split('\n');

    // Find minimum indent level to use as base (0)
    let minLevel = Infinity;
    lines.forEach(line => {
      const levelMatch = line.match(/{{ULI:(\d+)}}/);
      if (levelMatch) {
        minLevel = Math.min(minLevel, parseInt(levelMatch[1], 10));
      }
    });
    if (minLevel === Infinity) minLevel = 0;

    lines.forEach(line => {
      const levelMatch = line.match(/{{ULI:(\d+)}}([\s\S]*?){{\/ULI}}/);
      if (levelMatch) {
        // Normalize level relative to minimum
        const level = parseInt(levelMatch[1], 10) - minLevel;
        const content = levelMatch[2];

        // Close lists if going up levels
        while (currentLevel > level) {
          html += '</ul></li>';
          currentLevel--;
        }

        // Open new nested list if going deeper
        if (level > currentLevel) {
          // Remove closing </li> from previous item to nest inside it
          html = html.replace(/<\/li>$/, '');
          while (currentLevel < level) {
            html += '<ul>';
            currentLevel++;
          }
        }

        html += `<li>${content}</li>`;
      }
    });

    // Close any remaining open lists
    while (currentLevel > 0) {
      html += '</ul></li>';
      currentLevel--;
    }

    return '<ul>' + html + '</ul>\n';
  });

  md = md.replace(/({{TASK_DONE}}[\s\S]*?{{\/TASK_DONE}}\n?|{{TASK}}[\s\S]*?{{\/TASK}}\n?)+/g, (match) => {
    const items = match
      .replace(/{{TASK_DONE}}([\s\S]*?){{\/TASK_DONE}}/g, '<li class="task-item task-done"><input type="checkbox" checked disabled> $1</li>')
      .replace(/{{TASK}}([\s\S]*?){{\/TASK}}/g, '<li class="task-item"><input type="checkbox" disabled> $1</li>');
    return '<ul class="task-list">' + items.trim() + '</ul>\n';
  });

  // Before paragraph processing, ensure block elements are separated from preceding text
  // This handles cases like "**What it does:**\n- item" or "text:\n```code```"
  md = md.replace(/([^\n])\n(<(?:ul|ol|table|blockquote|div)[ >])/g, '$1\n\n$2');
  md = md.replace(/([^\n])\n({{CODE_BLOCK_\d+}})/g, '$1\n\n$2');
  // Text right after a closing fence starts a paragraph of its own
  md = md.replace(/^({{CODE_BLOCK_\d+}})\n(?=[^\n])/gm, '$1\n\n');

  // Paragraphs - split on double newlines and wrap non-block content
  const blocks = md.split(/\n\n+/);
  md = blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    // Don't wrap if it's already a block element
    if (/^<(h[1-6]|ul|ol|pre|table|blockquote|div)/.test(block)) {
      return block;
    }
    // Don't wrap code block placeholders
    if (/^{{CODE_BLOCK_\d+}}$/.test(block)) {
      return block;
    }
    // Don't wrap if block contains a code block placeholder (mixed content)
    if (/{{CODE_BLOCK_\d+}}/.test(block)) {
      // Split on code block, wrap text parts in <p>, leave code blocks alone
      return block.replace(/^(.+?)({{CODE_BLOCK_\d+}})$/s, (m, text, code) => {
        return '<p>' + hardBreaks(text.trim()) + '</p>\n' + code;
      });
    }
    return '<p>' + hardBreaks(block) + '</p>';
  }).join('\n');

  // Restore code blocks
  codeBlocks.forEach((code, index) => {
    md = md.replace(`{{CODE_BLOCK_${index}}}`, code);
  });

  // Restore inline code
  inlineCode.forEach((code, index) => {
    md = md.replace(`{{INLINE_CODE_${index}}}`, code);
  });

  // Clean up any wrapped code blocks or empty paragraphs
  md = md.replace(/<p>\s*(<pre>)/g, '$1');
  md = md.replace(/(<\/pre>)\s*<\/p>/g, '$1');
  md = md.replace(/<p>\s*<\/p>/g, '');

  return md;
}

module.exports = { markdownToHtml };
