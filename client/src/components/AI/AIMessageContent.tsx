import React from "react";

interface AIMessageContentProps {
  content: string;
  attachments?: Array<{ format: string; filename: string; mimeType: string; data: string }>;
}

const INTERNAL_LINK_PATTERN = /(\[[^\]]+\]\(\/[A-Za-z0-9_?=&./-]+\))/g;

export function AIMessageContent({ content, attachments = [] }: AIMessageContentProps) {
  return (
    <>
      {content.split(INTERNAL_LINK_PATTERN).map((part, index) => {
        const match = part.match(/^\[([^\]]+)\]\((\/[^)]+)\)$/);
        if (!match) return <React.Fragment key={index}>{part}</React.Fragment>;

        return (
          <a
            key={index}
            href={match[2]}
            className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
          >
            {match[1]}
          </a>
        );
      })}
      {attachments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-200 pt-2">
          {attachments.map((attachment) => (
            <a
              key={attachment.filename}
              href={`data:${attachment.mimeType};base64,${attachment.data}`}
              download={attachment.filename}
              className="rounded border border-blue-200 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
            >
              Download {attachment.format.toUpperCase()}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
