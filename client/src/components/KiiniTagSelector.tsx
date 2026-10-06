import { useId, useMemo, useState } from "react";
import { X } from "lucide-react";
import { normalizeTagList } from "@/lib/procurement-form-utils";
import { trpc } from "@/lib/trpc";

interface KiiniTagSelectorProps {
  value: string | string[] | null | undefined;
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function KiiniTagSelector({
  value,
  onChange,
  placeholder = "Add a tag and press Enter",
  className = "",
}: KiiniTagSelectorProps) {
  const tags = useMemo(() => normalizeTagList(value), [value]);
  const [draft, setDraft] = useState("");
  const suggestionListId = useId();
  const { data: tagSettings } = trpc.settings.getByCategory.useQuery({ category: "global_tags" }, { staleTime: 60_000 });
  const configuredTags = (() => {
    try {
      const parsed = JSON.parse(tagSettings?.list || "null");
      return Array.isArray(parsed)
        ? parsed.map((tag) => typeof tag === "string" ? tag : tag?.name).filter(Boolean) as string[]
        : [];
    } catch {
      return [];
    }
  })();

  const commitDraft = (raw: string) => {
    const next = raw.trim();
    if (!next) return;
    onChange(normalizeTagList([...tags, next]));
    setDraft("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft(draft);
      return;
    }

    if (event.key === "Backspace" && !draft && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className={`kiini-tag-input ${className}`.trim()}>
      <div className="kiini-tag-stack">
        {tags.map((tag) => (
          <span key={tag} className="kiini-tag-chip">
            {tag}
            <button
              type="button"
              className="kiini-tag-remove"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(tags.filter((item) => item !== tag))}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commitDraft(draft)}
        list={suggestionListId}
        className="kiini-tag-input-field"
        placeholder={placeholder}
      />
      {configuredTags.length > 0 && (
        <datalist id={suggestionListId}>
          {configuredTags.map((tag) => <option key={tag} value={tag} />)}
        </datalist>
      )}
    </div>
  );
}
