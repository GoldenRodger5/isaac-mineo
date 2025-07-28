import React, { useState, useMemo } from 'react';

const FileBrowser = ({ 
  files, 
  selectedFile, 
  onFileSelect, 
  loading, 
  error, 
  selectedRepo 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExtension, setSelectedExtension] = useState('all');

  const getFileIcon = (extension, fileName) => {
    const icons = {
      '.js': '🟨',
      '.jsx': '⚛️',
      '.ts': '🔷',
      '.tsx': '⚛️',
      '.py': '🐍',
      '.java': '☕',
      '.cpp': '⚡',
      '.c': '⚡',
      '.go': '🔵',
      '.rs': '🦀',
      '.php': '🐘',
      '.rb': '💎',
      '.swift': '🍎',
      '.kt': '🟣',
      '.html': '🌐',
      '.css': '🎨',
      '.scss': '🎨',
      '.json': '📋',
      '.md': '📝',
      '.yml': '⚙️',
      '.yaml': '⚙️',
      '.txt': '📄',
      '.sh': '🔧',
      '.dockerfile': '🐳'
    };

    // Special file names
    if (fileName.toLowerCase() === 'readme.md') return '📖';
    if (fileName.toLowerCase() === 'package.json') return '📦';
    if (fileName.toLowerCase() === 'dockerfile') return '🐳';
    if (fileName.toLowerCase().includes('license')) return '📜';

    return icons[extension] || '📄';
  };

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const organizeFilesByFolder = (files) => {
    const organized = {};
    
    files.forEach(file => {
      const pathParts = file.path.split('/');
      const fileName = pathParts.pop();
      const folderPath = pathParts.join('/') || 'root';
      
      if (!organized[folderPath]) {
        organized[folderPath] = [];
      }
      
      organized[folderPath].push({
        ...file,
        fileName,
        folderPath
      });
    });

    // Sort folders and files
    Object.keys(organized).forEach(folder => {
      organized[folder].sort((a, b) => a.fileName.localeCompare(b.fileName));
    });

    return organized;
  };

  const filteredFiles = useMemo(() => {
    let filtered = files;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.path.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by extension
    if (selectedExtension !== 'all') {
      filtered = filtered.filter(file => file.extension === selectedExtension);
    }

    return filtered;
  }, [files, searchTerm, selectedExtension]);

  const organizedFiles = useMemo(() => 
    organizeFilesByFolder(filteredFiles), [filteredFiles]
  );

  const extensions = useMemo(() => {
    const exts = [...new Set(files.map(f => f.extension))].filter(Boolean);
    return exts.sort();
  }, [files]);

  if (!selectedRepo) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 h-full flex flex-col">
        <h2 className="text-base font-semibold text-white mb-4">Files</h2>
        <div className="text-center py-8 flex-1 flex flex-col justify-center">
          <div className="text-3xl mb-3">📁</div>
          <p className="text-gray-400 text-sm">Select a repository to view files</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 h-full flex flex-col">
        <h2 className="text-base font-semibold text-white mb-4">Files</h2>
        <div className="space-y-2 flex-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-white/10 rounded h-6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 h-full flex flex-col">
        <h2 className="text-base font-semibold text-white mb-4">Files</h2>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2 className="text-base font-semibold text-white">Files</h2>
        <div className="bg-green-500/20 px-2 py-1 rounded-full">
          <span className="text-green-300 text-xs font-medium">{files.length}</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-2 mb-3 flex-shrink-0">
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/15"
        />
        
        <select
          value={selectedExtension}
          onChange={(e) => setSelectedExtension(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
        >
          <option value="all">All extensions</option>
          {extensions.map(ext => (
            <option key={ext} value={ext} className="bg-gray-800">
              {ext} ({files.filter(f => f.extension === ext).length})
            </option>
          ))}
        </select>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {Object.entries(organizedFiles).map(([folderPath, folderFiles]) => (
          <div key={folderPath} className="space-y-1">
            {/* Folder Header */}
            <div className="flex items-center space-x-2 px-2 py-1 bg-white/5 rounded-md">
              <span className="text-yellow-400 text-sm">📁</span>
              <span className="text-gray-300 text-xs font-medium truncate">
                {folderPath === 'root' ? '📁 Root' : folderPath}
              </span>
              <span className="text-xs text-gray-500 flex-shrink-0">({folderFiles.length})</span>
            </div>

            {/* Files in Folder */}
            <div className="ml-3 space-y-1">
              {folderFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => onFileSelect(file)}
                  className={`w-full text-left p-2 rounded-md transition-all duration-200 group ${
                    selectedFile?.path === file.path
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'hover:bg-white/10 border border-transparent hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span className="text-xs">
                        {getFileIcon(file.extension, file.fileName)}
                      </span>
                      <span className={`text-xs truncate ${
                        selectedFile?.path === file.path ? 'text-blue-300' : 'text-white group-hover:text-blue-300'
                      }`}>
                        {file.fileName}
                      </span>
                    </div>
                    
                    {file.size && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatFileSize(file.size)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-6 flex-1 flex flex-col justify-center">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-gray-400 text-sm">No files found</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-400 hover:text-blue-300 text-xs mt-2"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileBrowser;
