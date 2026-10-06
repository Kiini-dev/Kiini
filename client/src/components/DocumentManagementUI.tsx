import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Folder, Upload, Share2, Download, Trash2, Lock, Eye, MoreVertical, FolderPlus, Check } from 'lucide-react';
import { trpc } from '@/utils/trpc';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  folderId: string;
  isShared: boolean;
  permissions: 'view' | 'edit' | 'admin';
}

interface Folder {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  documentCount: number;
}

/**
 * Document Management System UI
 * Handles file uploads, organization, sharing, and version control
 */
export function DocumentManagementUI() {
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: '1',
      name: 'Invoices',
      description: 'All invoice documents',
      createdAt: new Date(),
      documentCount: 45,
    },
    {
      id: '2',
      name: 'Policies',
      description: 'Company policies and compliance docs',
      createdAt: new Date(),
      documentCount: 12,
    },
    {
      id: '3',
      name: 'Contracts',
      description: 'Client and vendor contracts',
      createdAt: new Date(),
      documentCount: 23,
    },
  ]);

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc1',
      name: 'Invoice_Q1_2026.pdf',
      type: 'application/pdf',
      size: 2.4,
      uploadedBy: 'John Doe',
      uploadedAt: new Date('2026-03-20'),
      folderId: '1',
      isShared: false,
      permissions: 'admin',
    },
    {
      id: 'doc2',
      name: 'Data_Retention_Policy.docx',
      type: 'application/msword',
      size: 0.8,
      uploadedBy: 'Jane Smith',
      uploadedAt: new Date('2026-03-15'),
      folderId: '2',
      isShared: true,
      permissions: 'view',
    },
  ]);

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
    },
  });

  async function handleFileDrop(acceptedFiles: File[]) {
    for (const file of acceptedFiles) {
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size / (1024 * 1024), // MB
        uploadedBy: 'Current User',
        uploadedAt: new Date(),
        folderId: selectedFolder || '1',
        isShared: false,
        permissions: 'admin',
      };
      setDocuments([...documents, newDoc]);
    }
  }

  function handleCreateFolder() {
    if (!newFolderName.trim()) return;

    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      createdAt: new Date(),
      documentCount: 0,
    };

    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setShowNewFolderDialog(false);
  }

  const filteredDocuments = documents.filter(
    (doc) =>
      (!selectedFolder || doc.folderId === selectedFolder) &&
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b p-6">
        <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
        <p className="text-gray-600 mt-1">Organize, share, and manage your organization's documents</p>
      </div>

      <div className="flex flex-1">
        {/* Sidebar - Folders */}
        <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
          <button
            onClick={() => setShowNewFolderDialog(true)}
            className="w-full flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <FolderPlus size={18} />
            New Folder
          </button>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => setSelectedFolder(null)}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                selectedFolder === null ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Folder size={18} />
              All Documents
            </button>

            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center justify-between transition ${
                  selectedFolder === folder.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder size={18} />
                  <span className="truncate">{folder.name}</span>
                </div>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">{folder.documentCount}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Search & Actions */}
          <div className="border-b p-6 bg-gray-50">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {selectedDocuments.size > 0 && (
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    <Share2 size={18} className="inline mr-2" />
                    Share ({selectedDocuments.size})
                  </button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    <Trash2 size={18} className="inline mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upload Zone or Document List */}
          {filteredDocuments.length === 0 && selectedDocuments.size === 0 ? (
            <div
              {...getRootProps()}
              className={`flex-1 flex items-center justify-center border-2 border-dashed m-6 rounded-lg cursor-pointer transition ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-xl font-semibold text-gray-700">
                  {isDragActive ? 'Drop files here' : 'Drag documents here to upload'}
                </p>
                <p className="text-gray-500">or click to select files</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocuments.has(doc.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedDocuments);
                        if (e.target.checked) {
                          newSelected.add(doc.id);
                        } else {
                          newSelected.delete(doc.id);
                        }
                        setSelectedDocuments(newSelected);
                      }}
                      className="w-5 h-5"
                    />
                    <FileText size={24} className="text-gray-400" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        {doc.size.toFixed(1)} MB • {doc.uploadedBy} • {doc.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.isShared && <Check size={18} className="text-green-500" />}
                      <button className="p-2 hover:bg-gray-200 rounded transition">
                        <Eye size={18} className="text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded transition">
                        <Download size={18} className="text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded transition">
                        <MoreVertical size={18} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Create New Folder</h2>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowNewFolderDialog(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
