import { useEffect, useMemo, useRef, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ChevronRight, Download, Eye, Folder, FolderOpen, FolderPlus, Grid2X2, List, Mail, MoreVertical, Search,
  Share2, Star, StarIcon, Trash2, Upload, Users, X,
} from "lucide-react";

type ViewMode = "grid" | "list";
type FileKind = "folder" | "pdf" | "doc" | "xls" | "img" | "fig" | "zip";
type ConfiguredFolderCategory = "file_folders" | "default_folders";
interface FileItem { id: string; parent: string; name: string; kind: FileKind; size: string; modified: string; starred?: boolean; url?: string; tags?: string[]; configuredCategory?: ConfiguredFolderCategory; }

const coreFolders = [
  { id: "root", label: "My Drive", icon: FolderOpen },
  { id: "shared", label: "Shared with me", icon: Users },
  { id: "starred", label: "Starred", icon: StarIcon },
  { id: "trash", label: "Trash", icon: Trash2 },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

const kindStyle: Record<FileKind, { bg: string; text: string }> = {
  folder: { bg: "bg-slate-50", text: "text-teal-500" },
  pdf: { bg: "bg-rose-50", text: "text-rose-500" },
  doc: { bg: "bg-sky-50", text: "text-sky-600" },
  xls: { bg: "bg-emerald-50", text: "text-emerald-600" },
  img: { bg: "bg-amber-50", text: "text-amber-500" },
  fig: { bg: "bg-violet-50", text: "text-violet-600" },
  zip: { bg: "bg-slate-100", text: "text-slate-600" },
};

export default function FileManager() {
  const [currentFolder, setCurrentFolder] = useState("root");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const folderQuery = trpc.fileStorage.listFolders.useQuery();
  const fileManagerSettingsQuery = trpc.fileStorage.getFileManagerSettings.useQuery();
  const allDocumentsQuery = trpc.fileStorage.listDocuments.useQuery({ limit: 1000 });
  const documentsQuery = trpc.fileStorage.listDocuments.useQuery({
    limit: 100,
    folderId: currentFolder === "root" ? null : ["starred", "shared", "trash"].includes(currentFolder) ? undefined : currentFolder,
  });
  const utils = trpc.useUtils();
  const updateFolderSettingsMutation = trpc.settings.updateByCategory.useMutation({
    onSuccess: () => { void fileManagerSettingsQuery.refetch(); },
    onError: (error) => toast.error(error.message || "Could not update folder settings"),
  });
  const uploadMutation = trpc.fileStorage.uploadDocument.useMutation({
    onSuccess: () => {
      toast.success("File uploaded");
      utils.fileStorage.listDocuments.invalidate();
    },
    onError: (error) => toast.error(error.message || "Upload failed"),
  });
  const updateDocumentMutation = trpc.fileStorage.updateDocument.useMutation({
    onSuccess: () => utils.fileStorage.listDocuments.invalidate(),
    onError: (error) => toast.error(error.message || "Could not update file"),
  });
  const createFolderMutation = trpc.fileStorage.createFolder.useMutation({
    onSuccess: (data) => { setNewFolderName(""); setCurrentFolder(data.folder.id); folderQuery.refetch(); toast.success("Folder created"); },
    onError: (error) => toast.error(error.message || "Could not create folder"),
  });
  const deleteFolderMutation = trpc.fileStorage.deleteFolder.useMutation({
    onSuccess: () => { folderQuery.refetch(); utils.fileStorage.listDocuments.invalidate(); toast.success("Folder deleted"); },
    onError: (error) => toast.error(error.message || "Could not delete folder"),
  });
  const deleteDocumentMutation = trpc.fileStorage.deleteDocument.useMutation({
    onSuccess: () => { utils.fileStorage.listDocuments.invalidate(); toast.success("File deleted"); },
    onError: (error) => toast.error(error.message || "Could not delete file"),
  });
  const moveDocumentMutation = trpc.fileStorage.moveDocument.useMutation({
    onSuccess: () => { utils.fileStorage.listDocuments.invalidate(); toast.success("File moved"); },
    onError: (error) => toast.error(error.message || "Could not move file"),
  });
  const emailDocumentMutation = trpc.fileStorage.emailDocument.useMutation({
    onSuccess: () => toast.success("File email queued"),
    onError: (error) => toast.error(error.message || "Could not email file"),
  });

  const getKind = (name: string, mimeType?: string | null): FileKind => {
    if (mimeType?.includes("pdf") || name.toLowerCase().endsWith(".pdf")) return "pdf";
    if (mimeType?.includes("spreadsheet") || /\.(xls|xlsx|csv)$/i.test(name)) return "xls";
    if (mimeType?.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp)$/i.test(name)) return "img";
    if (mimeType?.includes("zip") || /\.(zip|json|xml)$/i.test(name)) return "zip";
    if (mimeType?.includes("fig") || name.toLowerCase().endsWith(".fig")) return "fig";
    return "doc";
  };

  const remoteFiles = useMemo<FileItem[]>(() => {
    return (documentsQuery.data?.documents || []).map((document: any): FileItem => ({
      id: document.id,
      parent: document.folderId || "root",
      name: document.documentName,
      kind: getKind(document.documentName, document.mimeType),
      size: document.fileSize ? `${Math.max(1, Math.round(document.fileSize / 1024))} KB` : "-",
      modified: document.createdAt ? new Date(document.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently",
      url: document.fileUrl,
      tags: Array.isArray(document.tags) ? document.tags : [],
      starred: Array.isArray(document.tags) && document.tags.includes("starred"),
    }));
  }, [documentsQuery.data]);

  const persistedFolders = useMemo<FileItem[]>(() => (folderQuery.data?.folders || []).map((folder: any) => ({ id: folder.id, parent: folder.parentId || "root", name: folder.name, kind: "folder", size: "-", modified: folder.createdAt ? new Date(folder.createdAt).toLocaleDateString() : "Recently" })), [folderQuery.data]);
  const configuredFolders = useMemo<FileItem[]>(() => [
    ...(fileManagerSettingsQuery.data?.fileFolders || []).map((folder) => ({
      id: folder.id, parent: "root", name: folder.name, kind: "folder" as const, size: "-", modified: "Configured", configuredCategory: "file_folders" as const,
    })),
    ...(fileManagerSettingsQuery.data?.defaultFolders || []).map((folder) => ({
      id: folder.id, parent: "root", name: folder.name, kind: "folder" as const, size: "-", modified: "Default", configuredCategory: "default_folders" as const,
    })),
  ], [fileManagerSettingsQuery.data]);
  const files = useMemo(() => [...persistedFolders, ...configuredFolders, ...remoteFiles], [persistedFolders, configuredFolders, remoteFiles]);

  const visibleFiles = useMemo(() => {
    const scoped = currentFolder === "starred"
      ? files.filter((file) => file.starred)
      : currentFolder === "shared"
        ? files.filter((file) => file.tags?.includes("shared"))
        : currentFolder === "trash"
          ? files.filter((file) => file.tags?.includes("trash"))
          : currentFolder === "root"
            ? files.filter((file) => file.parent === "root")
            : files.filter((file) => file.parent === currentFolder);

    return scoped.filter((file) => file.name.toLowerCase().includes(query.toLowerCase()));
  }, [currentFolder, files, query]);

  const folders = useMemo(() => [
    ...coreFolders,
    ...configuredFolders.map((folder) => ({ id: folder.id, label: folder.name, icon: Folder })),
    ...persistedFolders.filter((folder) => !configuredFolders.some((configured) => configured.id === folder.id)).map((folder) => ({ id: folder.id, label: folder.name, icon: Folder })),
  ], [configuredFolders, persistedFolders]);

  const currentLabel = folders.find((folder) => folder.id === currentFolder)?.label || "My Drive";
  const toggleStar = (id: string) => {
    const file = files.find((item) => item.id === id);
    if (!file) return;
    const starred = !file.starred;

    if (file.url) {
      const tags = (file.tags || []).filter((tag) => tag !== "starred");
      updateDocumentMutation.mutate({ documentId: id, tags: starred ? [...tags, "starred"] : tags });
    } else {
      toast.info("Folders cannot be starred");
    }
  };
  const openFile = (file: FileItem) => { if (file.kind === "folder") { setCurrentFolder(file.id); setQuery(""); } };
  const uploadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => uploadMutation.mutate({
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      fileData: reader.result as string,
      documentType: "other",
      tags: [currentFolder === "root" ? "My Drive" : currentLabel],
      folderId: currentFolder === "root" ? null : currentFolder,
    });
    reader.onerror = () => toast.error("Could not read that file");
    reader.readAsDataURL(file);
  };
  const allowedTypes = (fileManagerSettingsQuery.data?.filesGeneral.allowedTypes || "pdf,doc,docx,xls,xlsx,png,jpg,jpeg")
    .split(",").map((type) => type.trim().toLowerCase().replace(/^\./, "")).filter(Boolean);
  const allowedExtensions = allowedTypes.map((type) => `.${type}`).join(",");
  const maxFileSizeBytes = Math.max(1, Number(fileManagerSettingsQuery.data?.filesGeneral.maxSizeMb) || 10) * 1024 * 1024;
  const maxFilesPerUpload = Math.max(1, Math.floor(Number(fileManagerSettingsQuery.data?.filesGeneral.maxFilesPerUpload) || 10));
  const uploadFiles = (filesToUpload: File[]) => {
    if (filesToUpload.length > maxFilesPerUpload) {
      toast.error(`Select no more than ${maxFilesPerUpload} files at a time`);
      return;
    }
    const invalidFile = filesToUpload.find((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      return file.size > maxFileSizeBytes || !allowedTypes.includes(extension);
    });
    if (invalidFile) {
      toast.error(invalidFile.size > maxFileSizeBytes
        ? `${invalidFile.name} exceeds the ${Math.round(maxFileSizeBytes / 1024 / 1024)} MB file limit`
        : `${invalidFile.name} is not an allowed file type`);
      return;
    }
    filesToUpload.forEach(uploadFile);
  };
  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    uploadFiles(Array.from(event.dataTransfer.files));
  };
  const createFolder = () => {
    const name = newFolderName.trim();
    if (!name) {
      toast.error("Please enter a folder name");
      return;
    }

    createFolderMutation.mutate({ name, parentId: currentFolder === "root" || ["starred", "trash", "shared"].includes(currentFolder) ? null : currentFolder });
  };
  const moveFileToFolder = (fileId: string, folderId: string) => {
    const remoteMatch = remoteFiles.find((item) => item.id === fileId);
    if (remoteMatch) {
      moveDocumentMutation.mutate({ documentId: fileId, folderId: folderId === "root" ? null : folderId });
    }
  };
  const handleFileAction = (action: string, file: FileItem) => {
    if (file.kind === "folder") {
      if (action === "delete" && window.confirm(`Delete folder ${file.name}?`)) {
        const deleteFolder = () => {
          if (currentFolder === file.id) setCurrentFolder("root");
          deleteFolderMutation.mutate({ folderId: file.id });
        };
        if (file.configuredCategory) {
          const configuredList = file.configuredCategory === "file_folders"
            ? fileManagerSettingsQuery.data?.fileFolders
            : fileManagerSettingsQuery.data?.defaultFolders;
          const nextList = (configuredList || []).filter((folder) => folder.id !== file.id);
          updateFolderSettingsMutation.mutate({
            category: file.configuredCategory,
            values: { list: JSON.stringify(nextList) },
          }, { onSuccess: deleteFolder });
        } else {
          deleteFolder();
        }
      }
      return;
    }
    if (action === "preview" && file.url) window.open(file.url, "_blank", "noopener,noreferrer");
    if (action === "download" && file.url) { const link = document.createElement("a"); link.href = file.url; link.download = file.name; link.click(); }
    if (action === "delete" && window.confirm(`Delete ${file.name}?`)) deleteDocumentMutation.mutate({ documentId: file.id });
    if (action === "move") { const target = window.prompt("Move to folder ID (root for My Drive):", currentFolder); if (target) moveFileToFolder(file.id, target); }
    if (action === "email") { const toEmail = window.prompt("Recipient email:"); if (toEmail) emailDocumentMutation.mutate({ documentId: file.id, toEmail, subject: `Shared file: ${file.name}` }); }
  };

  return (
    <ModuleLayout title="Files" description="Organize your workspace files and project assets" icon={<FolderOpen className="h-5 w-5" />} breadcrumbs={[{ label: "Dashboard", href: "/crm-home" }, { label: "Files" }]} actions={<>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5">
          <Input value={newFolderName} onChange={(event) => setNewFolderName(event.target.value)} placeholder="New folder name" className="h-8 w-28 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" />
          <Button variant="outline" size="sm" onClick={createFolder} className="h-8"><FolderPlus className="mr-1 h-4 w-4" /> Create</Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Upload</Button>
        <input ref={inputRef} type="file" multiple accept={allowedExtensions} className="hidden" onChange={(event) => { uploadFiles(Array.from(event.target.files || [])); event.target.value = ""; }} />
      </div>
    </>}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Storage", value: formatFileSize(allDocumentsQuery.data?.totalSize || 0), description: "Stored files" },
            { label: "Shared", value: String((allDocumentsQuery.data?.documents || []).filter((file: any) => Array.isArray(file.tags) && file.tags.includes("shared")).length), description: "Shared files" },
            { label: "Starred", value: String((allDocumentsQuery.data?.documents || []).filter((file: any) => Array.isArray(file.tags) && file.tags.includes("starred")).length), description: "Pinned files" },
            { label: "Folders", value: String(folders.length - coreFolders.length), description: "Workspace folders" },
          ].map((meta) => (
            <div key={meta.label} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-700 dark:bg-slate-900/85">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">{meta.label}</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{meta.value}</p>
                <span className="rounded-full bg-teal-50 px-1.5 py-0.5 text-[9px] font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">{meta.description}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="grid min-h-[560px] lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="hidden border-r border-slate-200 bg-slate-50/80 p-2.5 lg:flex lg:flex-col dark:border-slate-700 dark:bg-slate-950/40">
              <nav className="space-y-1">
                {folders.map(({ id, label, icon: Icon }) => <button key={id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const target = event.dataTransfer.getData("text/plain"); if (target) moveFileToFolder(target, id); }} onClick={() => { setCurrentFolder(id); setQuery(""); }} className={cn("flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition", currentFolder === id ? "bg-teal-50 font-semibold text-teal-700 ring-1 ring-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:ring-teal-900/50" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}><Icon className="h-4 w-4" /><span>{label}</span></button>)}
              </nav>
              <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-700">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Storage</p>
                <p className="text-xs text-slate-500">{formatFileSize(allDocumentsQuery.data?.totalSize || 0)} stored</p>
              </div>
            </aside>
            <section
              className={cn("relative min-w-0 transition-colors", isDragging && "bg-teal-50/60 dark:bg-teal-950/20")}
              onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDragging(false); }}
              onDrop={handleDrop}
            >
              {isDragging && <div className="pointer-events-none absolute inset-4 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-teal-500 bg-white/80 text-sm font-semibold text-teal-700 shadow-sm dark:bg-slate-900/80 dark:text-teal-300">Drop file to upload</div>}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/40">
                <div className="flex items-center gap-2 text-sm text-slate-500"><button onClick={() => setCurrentFolder("root")} className="font-semibold text-slate-900 dark:text-white">My Drive</button>{currentFolder !== "root" && <><ChevronRight className="h-4 w-4" /><span className="font-semibold text-slate-900 dark:text-white">{currentLabel}</span></>}</div>
                <div className="flex items-center gap-2"><div className="relative w-52"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files..." className="h-9 pl-9" />{query && <button onClick={() => setQuery("")} className="absolute right-2 top-2.5"><X className="h-4 w-4 text-slate-400" /></button>}</div><div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"><button aria-label="Grid view" onClick={() => setViewMode("grid")} className={cn("p-2", viewMode === "grid" ? "bg-teal-50 text-teal-600" : "text-slate-400")}><Grid2X2 className="h-4 w-4" /></button><button aria-label="List view" onClick={() => setViewMode("list")} className={cn("p-2", viewMode === "list" ? "bg-teal-50 text-teal-600" : "text-slate-400")}><List className="h-4 w-4" /></button></div></div>
              </div>
              <div className={cn("p-4", viewMode === "grid" ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" : "space-y-2")}>
                {visibleFiles.map((file) => {
                  const style = kindStyle[file.kind];
                  return (
                    <button
                      key={file.id}
                      draggable={file.kind !== "folder"}
                      onDragStart={(event) => {
                        if (file.kind !== "folder") {
                          event.dataTransfer.setData("text/plain", file.id);
                          event.dataTransfer.effectAllowed = "move";
                        }
                      }}
                      onClick={() => {
                        if (file.kind === "folder") return;
                        if (file.url) window.open(file.url, "_blank", "noopener,noreferrer");
                        else toast.info("This file is not available for download yet.");
                      }}
                      onDoubleClick={() => openFile(file)}
                      className={cn(
                        "group relative text-left transition hover:-translate-y-0.5",
                        viewMode === "grid"
                          ? "rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                          : "flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                      )}
                    >
                      <div className={cn("flex items-center justify-center rounded-lg", style.bg, viewMode === "grid" ? "mb-3 h-24 w-full" : "h-11 w-11 shrink-0")}>
                        {file.kind === "folder" ? <Folder className={cn("h-8 w-8", style.text)} /> : <span className={cn("text-xs font-bold uppercase", style.text)}>{file.name.split(".").pop()}</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{file.size} · {file.modified}</p>
                      </div>
                      <button
                        aria-label={file.starred ? "Unstar file" : "Star file"}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleStar(file.id);
                        }}
                        className="absolute right-2 top-2 p-1 text-amber-500 opacity-0 transition group-hover:opacity-100"
                      >
                        {file.starred ? <Star className="h-4 w-4 fill-current" /> : <Star className="h-4 w-4" />}
                      </button>
                      <span className="absolute bottom-2 right-2 flex gap-1 rounded bg-white/90 p-1 opacity-0 shadow-sm transition group-hover:opacity-100 dark:bg-slate-800/90">
                        {[{ action: "preview", icon: Eye }, { action: "download", icon: Download }, { action: "move", icon: Folder }, { action: "email", icon: Mail }, { action: "delete", icon: Trash2 }].map(({ action, icon: ActionIcon }) => <button key={action} type="button" title={action} onClick={(event) => { event.stopPropagation(); handleFileAction(action, file); }} className="p-1 text-slate-500 hover:text-teal-600"><ActionIcon className="h-3.5 w-3.5" /></button>)}
                      </span>
                    </button>
                  );
                })}
                {!visibleFiles.length && (
                  <div className="col-span-full py-14 text-center">
                    <FolderOpen className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">This folder is empty</p>
                    <p className="mt-1 text-sm text-slate-500">{documentsQuery.isLoading ? "Loading your files..." : "Upload a file to get started."}</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}