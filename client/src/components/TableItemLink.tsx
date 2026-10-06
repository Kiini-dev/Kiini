import type { ReactNode } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface TableItemLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  title?: string;
}

export function TableItemLink({ href, children, className, title }: TableItemLinkProps) {
  return (
    <Link
      href={href}
      title={title}
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "rounded-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {children}
    </Link>
  );
}
