import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split into paragraphs/blocks by double newline
  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-3 text-xs leading-relaxed text-[#F5F5F2]">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();

        // 1. Code / Formula Block
        if (trimmed.startsWith('```')) {
          const codeLines = trimmed.split('\n');
          const codeContent = codeLines.slice(1, -1).join('\n');
          return (
            <pre
              key={idx}
              className="p-3 bg-[#15161F] border border-[#343541] rounded-lg font-mono text-[11px] text-[#D8FF9A] overflow-x-auto whitespace-pre-wrap"
            >
              <code>{codeContent || trimmed.replace(/```/g, '')}</code>
            </pre>
          );
        }

        // 2. Heading 3 / Heading 2 / Heading 1
        if (trimmed.startsWith('#')) {
          const match = trimmed.match(/^(#{1,4})\s+(.*)/);
          if (match) {
            const titleText = match[2];
            return (
              <h4 key={idx} className="font-bold text-sm text-[#BFA7FF] mt-2 mb-1 border-b border-[#343541]/50 pb-1">
                {renderInlineFormatted(titleText)}
              </h4>
            );
          }
        }

        // 3. Bullet list items
        if (trimmed.split('\n').every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '))) {
          const items = trimmed.split('\n').map((line) => line.replace(/^[-*]\s+/, ''));
          return (
            <ul key={idx} className="space-y-1.5 pl-4 list-disc marker:text-[#BFA7FF]">
              {items.map((item, i) => (
                <li key={i}>{renderInlineFormatted(item)}</li>
              ))}
            </ul>
          );
        }

        // 4. Numbered list items
        if (trimmed.split('\n').every((line) => /^\d+\.\s+/.test(line.trim()))) {
          const items = trimmed.split('\n').map((line) => line.replace(/^\d+\.\s+/, ''));
          return (
            <ol key={idx} className="space-y-1.5 pl-4 list-decimal marker:text-[#D8FF9A]">
              {items.map((item, i) => (
                <li key={i}>{renderInlineFormatted(item)}</li>
              ))}
            </ol>
          );
        }

        // 5. Standard paragraph with multi-line splits
        const lines = trimmed.split('\n');
        return (
          <p key={idx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInlineFormatted(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};

function renderInlineFormatted(text: string): React.ReactNode {
  // Regex to match **bold**, *italic*, `code`, and [links]
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    // Code `text`
    const codeMatch = remaining.match(/`(.*?)`/);

    let firstMatch: { type: 'bold' | 'code'; index: number; length: number; content: string } | null = null;

    if (boldMatch && boldMatch.index !== undefined) {
      firstMatch = { type: 'bold', index: boldMatch.index, length: boldMatch[0].length, content: boldMatch[1] };
    }

    if (codeMatch && codeMatch.index !== undefined) {
      if (!firstMatch || codeMatch.index < firstMatch.index) {
        firstMatch = { type: 'code', index: codeMatch.index, length: codeMatch[0].length, content: codeMatch[1] };
      }
    }

    if (!firstMatch) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (firstMatch.index > 0) {
      parts.push(<span key={key++}>{remaining.substring(0, firstMatch.index)}</span>);
    }

    if (firstMatch.type === 'bold') {
      parts.push(
        <strong key={key++} className="font-semibold text-[#F5F5F2] bg-[#20212C]/60 px-1 py-0.5 rounded border border-[#343541]/40">
          {firstMatch.content}
        </strong>
      );
    } else if (firstMatch.type === 'code') {
      parts.push(
        <code key={key++} className="font-mono text-[#D8FF9A] bg-[#15161F] px-1.5 py-0.5 rounded text-[11px] border border-[#343541]">
          {firstMatch.content}
        </code>
      );
    }

    remaining = remaining.substring(firstMatch.index + firstMatch.length);
  }

  return <>{parts}</>;
}
