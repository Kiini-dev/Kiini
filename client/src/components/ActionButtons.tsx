import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit,
  Trash2,
  Download,
  Mail,
  Copy,
  MoreVertical,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { ActionHandlers } from "@/lib/actions";

interface ActionButtonsProps {
  id: string | number;
  handlers: ActionHandlers;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showDownload?: boolean;
  showEmail?: boolean;
  showDuplicate?: boolean;
  variant?: "buttons" | "dropdown";
}

export function ActionButtons({
  id,
  handlers,
  showView = true,
  showEdit = true,
  showDelete = true,
  showDownload = false,
  showEmail = false,
  showDuplicate = false,
  variant = "buttons",
}: ActionButtonsProps) {
  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {showView && handlers.onView && (
            <DropdownMenuItem onClick={() => handlers.onView?.(id)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
          )}
          {showEdit && handlers.onEdit && (
            <DropdownMenuItem onClick={() => handlers.onEdit?.(id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {showDuplicate && handlers.onDuplicate && (
            <DropdownMenuItem onClick={() => handlers.onDuplicate?.(id)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
          )}
          {(showDownload || showEmail) && <DropdownMenuSeparator />}
          {showDownload && handlers.onDownload && (
            <DropdownMenuItem onClick={() => handlers.onDownload?.(id)}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
          )}
          {showEmail && handlers.onEmail && (
            <DropdownMenuItem onClick={() => handlers.onEmail?.(id)}>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
          )}
          {showDelete && <DropdownMenuSeparator />}
          {showDelete && handlers.onDelete && (
            <DropdownMenuItem
              onClick={() => handlers.onDelete?.(id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-1">
      {showView && handlers.onView && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlers.onView?.(id)}
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {showEdit && handlers.onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlers.onEdit?.(id)}
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {showDownload && handlers.onDownload && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" title="Download">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handlers.onDownload?.(id)}>
              <FileText className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlers.onDownload?.(id)}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {showEmail && handlers.onEmail && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlers.onEmail?.(id)}
          title="Send Email"
        >
          <Mail className="h-4 w-4" />
        </Button>
      )}
      {showDuplicate && handlers.onDuplicate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlers.onDuplicate?.(id)}
          title="Duplicate"
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
      {showDelete && handlers.onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlers.onDelete?.(id)}
          title="Delete"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default ActionButtons;

