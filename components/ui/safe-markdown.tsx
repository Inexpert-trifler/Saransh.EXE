"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface SafeMarkdownProps {
  content: string;
  className?: string;
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-xl border border-white/15 bg-[#0a0a0a] overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#141414] px-4 py-2 text-zinc-400">
        <span className="uppercase text-[11px] font-semibold tracking-wider text-zinc-400">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy code block"
          className="flex items-center gap-1.5 rounded px-2 py-1 text-[11px] hover:bg-white/10 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#B9FF66]" />
              <span className="text-[#B9FF66]">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>COPY</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-zinc-200 leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderInlineText(text: string): React.ReactNode[] {
  // Parses markdown links, bold, code, and images
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // 1. Markdown image: ![alt](url)
    const imgMatch = remaining.match(/^!\[(.*?)\]\((https?:\/\/[^\s)]+)\)/);
    if (imgMatch) {
      const [, alt, url] = imgMatch;
      nodes.push(
        <span key={`img-${keyIndex++}`} className="block my-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt || "Project asset"}
            loading="lazy"
            className="max-h-80 w-auto rounded-lg border border-white/10 bg-[#111111] object-contain shadow-md"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </span>
      );
      remaining = remaining.slice(imgMatch[0].length);
      continue;
    }

    // 2. Markdown link: [text](url)
    const linkMatch = remaining.match(/^\[(.*?)\]\(((?:https?:\/\/|#)[^\s)]+)\)/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      nodes.push(
        <a
          key={`link-${keyIndex++}`}
          href={href}
          target={href.startsWith("#") ? undefined : "_blank"}
          rel="noreferrer noopener"
          className="text-[#B9FF66] underline hover:text-[#a3e635] font-semibold break-all"
        >
          {label}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // 3. Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      nodes.push(
        <code
          key={`code-${keyIndex++}`}
          className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-[#B9FF66] border border-white/5"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // 4. Bold: **text** or __text__
    const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
    if (boldMatch) {
      nodes.push(
        <strong key={`bold-${keyIndex++}`} className="font-bold text-white">
          {boldMatch[2]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // 5. Plain character
    const nextSpecial = remaining.search(/(!\[|\[|`|\*\*|__)/);
    if (nextSpecial === -1) {
      nodes.push(<span key={`text-${keyIndex++}`}>{remaining}</span>);
      break;
    } else {
      nodes.push(
        <span key={`text-${keyIndex++}`}>
          {remaining.slice(0, nextSpecial)}
        </span>
      );
      remaining = remaining.slice(nextSpecial);
    }
  }

  return nodes;
}

export function SafeMarkdown({ content, className = "" }: SafeMarkdownProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";
  let listBuffer: string[] = [];
  let listIsOrdered = false;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    const ListTag = listIsOrdered ? "ol" : "ul";
    const items = [...listBuffer];
    listBuffer = [];
    elements.push(
      <ListTag
        key={`list-${elements.length}`}
        className={`my-3 space-y-1.5 pl-5 ${
          listIsOrdered ? "list-decimal text-zinc-300" : "list-none"
        }`}
      >
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {!listIsOrdered && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#B9FF66] mt-2 shrink-0" />
            )}
            <div>{renderInlineText(item)}</div>
          </li>
        ))}
      </ListTag>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block boundaries
    if (line.trim().startsWith("```")) {
      flushList();
      if (inCodeBlock) {
        elements.push(
          <CodeBlock
            key={`code-block-${elements.length}`}
            code={codeBuffer.join("\n")}
            language={codeLang}
          />
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLang = "";
      } else {
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Blank lines
    if (!line.trim()) {
      flushList();
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();

      if (level === 1) {
        elements.push(
          <h2
            key={`h1-${elements.length}`}
            className="mt-6 mb-3 text-xl sm:text-2xl font-black text-white uppercase tracking-tight border-b border-white/10 pb-2"
          >
            {renderInlineText(text)}
          </h2>
        );
      } else if (level === 2) {
        elements.push(
          <h3
            key={`h2-${elements.length}`}
            className="mt-5 mb-2.5 text-base sm:text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2"
          >
            <span className="text-[#B9FF66] font-mono text-xs">{"//"}</span>
            {renderInlineText(text)}
          </h3>
        );
      } else {
        elements.push(
          <h4
            key={`h3-${elements.length}`}
            className="mt-4 mb-2 text-xs sm:text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider"
          >
            {renderInlineText(text)}
          </h4>
        );
      }
      continue;
    }

    // Blockquote
    if (line.startsWith(">")) {
      flushList();
      const quoteText = line.replace(/^>\s*/, "");
      elements.push(
        <blockquote
          key={`quote-${elements.length}`}
          className="my-3 border-l-2 border-[#B9FF66] bg-white/5 pl-4 py-2 font-mono text-xs sm:text-sm text-zinc-300 italic rounded-r-lg"
        >
          {renderInlineText(quoteText)}
        </blockquote>
      );
      continue;
    }

    // Lists
    const bulletMatch = line.match(/^[-*+]\s+(.+)$/);
    if (bulletMatch) {
      if (listIsOrdered) flushList();
      listIsOrdered = false;
      listBuffer.push(bulletMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (!listIsOrdered) flushList();
      listIsOrdered = true;
      listBuffer.push(orderedMatch[1]);
      continue;
    }

    // Table rows: simply render with clean mono style
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      flushList();
      if (line.includes("---")) continue; // skip delimiter line
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      elements.push(
        <div
          key={`table-row-${elements.length}`}
          className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-1 p-2 rounded bg-white/5 font-mono text-xs text-zinc-300 border border-white/5"
        >
          {cells.map((cell, cIdx) => (
            <div key={cIdx} className="overflow-hidden truncate">
              {renderInlineText(cell)}
            </div>
          ))}
        </div>
      );
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p
        key={`p-${elements.length}`}
        className="my-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans"
      >
        {renderInlineText(line)}
      </p>
    );
  }

  flushList();

  return <div className={`safe-markdown space-y-1 ${className}`}>{elements}</div>;
}
