import React from 'react';

const RepositoryBrowser = ({ 
  repositories, 
  selectedRepo, 
  onRepoSelect, 
  loading, 
  error 
}) => {
  const getLanguageIcon = (language) => {
    const icons = {
      JavaScript: '🟨',
      TypeScript: '🔷',
      Python: '🐍',
      Java: '☕',
      'C++': '⚡',
      Go: '🔵',
      Rust: '🦀',
      PHP: '🐘',
      Ruby: '💎',
      Swift: '🍎',
      Kotlin: '🟣',
      Astro: '🚀',
      HTML: '🌐',
      CSS: '🎨'
    };
    return icons[language] || '📄';
  };

  const getRepoTypeIcon = (repo) => {
    if (repo.private) return '🔒';
    if (repo.language === 'JavaScript' && repo.name.includes('portfolio')) return '💼';
    if (repo.language === 'Python') return '🐍';
    return '📁';
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-white">Repositories</h2>
          <div className="animate-spin text-blue-400">⏳</div>
        </div>
        <div className="space-y-2 flex-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-white/10 rounded-lg h-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-white">Repositories</h2>
          <div className="text-red-400">❌</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-base font-semibold text-white truncate">Repositories</h2>
        <div className="bg-blue-500/20 px-2 py-1 rounded-full">
          <span className="text-blue-300 text-xs font-medium">{repositories.length}</span>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
        {repositories.map((repo) => (
          <button
            key={repo.full_name}
            onClick={() => onRepoSelect(repo)}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
              selectedRepo?.full_name === repo.full_name
                ? 'bg-blue-500/20 border border-blue-500/30 shadow-lg'
                : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <span className="text-base">{getRepoTypeIcon(repo)}</span>
                <div className="min-w-0 flex-1">
                  <h3 className={`font-medium transition-colors text-sm truncate ${
                    selectedRepo?.full_name === repo.full_name ? 'text-blue-300' : 'text-white group-hover:text-blue-300'
                  }`}>
                    {repo.name}
                  </h3>
                  {repo.private && (
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="text-xs bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded">
                        Private
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {repo.language && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <span className="text-sm">{getLanguageIcon(repo.language)}</span>
                  <span className="text-xs text-gray-400 hidden sm:inline">{repo.language}</span>
                </div>
              )}
            </div>

            {repo.description && (
              <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                {repo.description}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="truncate">Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
              {repo.size && (
                <span className="flex-shrink-0 ml-2">{Math.round(repo.size / 1024)} KB</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {repositories.length === 0 && !loading && !error && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📁</div>
          <p className="text-gray-400">No repositories found</p>
        </div>
      )}
    </div>
  );
};

export default RepositoryBrowser;
