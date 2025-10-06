'use client';

import { useState, useEffect } from 'react';

interface Song {
  id: string;
  title: string;
  status: string;
  audio_url?: string;
  image_url?: string;
  created_at: string;
  metadata?: {
    tags?: string;
  };
}

interface GenerationForm {
  title: string;
  lyrics: string;
  style: string;
  prompt: string;
}

export default function Generator() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [mode, setMode] = useState<'simple' | 'custom'>('simple');
  const [forms, setForms] = useState<GenerationForm[]>([
    { title: '', lyrics: '', style: '', prompt: '' }
  ]);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/get');
      const data = await response.json();
      setSongs(data || []);
    } catch (error) {
      console.error('Failed to load songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addForm = () => {
    if (forms.length < 10) {
      setForms([...forms, { title: '', lyrics: '', style: '', prompt: '' }]);
    }
  };

  const removeForm = (index: number) => {
    if (forms.length > 1) {
      setForms(forms.filter((_, i) => i !== index));
    }
  };

  const updateForm = (index: number, field: keyof GenerationForm, value: string) => {
    const newForms = [...forms];
    newForms[index][field] = value;
    setForms(newForms);
  };

  const handleGenerateAll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validForms = forms.filter(form => 
      mode === 'simple' ? form.prompt : form.lyrics
    );

    if (validForms.length === 0) {
      alert('Please fill in at least one form!');
      return;
    }

    setGenerating(true);
    
    try {
      const promises = validForms.map(async (form) => {
        const endpoint = mode === 'custom' ? '/api/custom_generate' : '/api/generate';
        
        const payload = mode === 'custom'
          ? {
              prompt: form.lyrics,
              tags: form.style,
              title: form.title,
              make_instrumental: false,
              wait_audio: false
            }
          : {
              prompt: form.prompt,
              make_instrumental: false,
              wait_audio: false
            };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        return response.json();
      });

      await Promise.all(promises);
      alert(`Started generating ${validForms.length} song(s)!`);
      
      setTimeout(() => loadSongs(), 2000);
      
    } catch (error) {
      console.error('Failed to generate:', error);
      alert('Failed to generate songs');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500/20 text-green-400';
      case 'streaming':
      case 'queued': return 'bg-yellow-500/20 text-yellow-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const toggleSongSelection = (songId: string) => {
    const newSelected = new Set(selectedSongs);
    if (newSelected.has(songId)) {
      newSelected.delete(songId);
    } else {
      newSelected.add(songId);
    }
    setSelectedSongs(newSelected);
  };

  const selectAll = () => {
    const completeSongs = songs.filter(s => s.status === 'complete' && s.audio_url);
    setSelectedSongs(new Set(completeSongs.map(s => s.id)));
  };

  const deselectAll = () => {
    setSelectedSongs(new Set());
  };

  const downloadSelected = async () => {
    const songsToDownload = songs.filter(s => selectedSongs.has(s.id) && s.audio_url);
    
    for (const song of songsToDownload) {
      try {
        const response = await fetch(song.audio_url!);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${song.title || 'Untitled'}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Failed to download:', song.title, error);
      }
    }
    
    alert(`Downloaded ${songsToDownload.length} song(s)!`);
  };

  const downloadSingleSong = async (audioUrl: string, title: string) => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'Untitled'}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download:', title, error);
      alert('Download failed. Please try again.');
    }
  };

  // Filter songs based on search query
  const filteredSongs = songs.filter(song => {
    const query = searchQuery.toLowerCase();
    const title = (song.title || '').toLowerCase();
    const tags = (song.metadata?.tags || '').toLowerCase();
    return title.includes(query) || tags.includes(query);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-950 to-gray-900 w-full">
      
      {/* Header Section with Form - Centered with max-width */}
      <div className="flex justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-orange-100 mb-3">
              Song Generator
            </h1>
            <p className="text-orange-200/80 text-lg">
              Create amazing AI-generated music with Suno
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-500/20 p-6 lg:p-8">
            
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6 bg-gray-900/50 rounded-xl p-1">
              <button
                onClick={() => setMode('simple')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all ${
                  mode === 'simple'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setMode('custom')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all ${
                  mode === 'custom'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Custom
              </button>
            </div>

            <form onSubmit={handleGenerateAll} className="space-y-6">
              {forms.map((form, index) => (
                <div key={index} className="space-y-4 p-4 bg-gray-900/30 rounded-xl border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-orange-300">Song #{index + 1}</span>
                    {forms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeForm(index)}
                        className="text-red-400 hover:text-red-300 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {mode === 'simple' ? (
                    <div>
                      <label className="block text-sm font-semibold text-orange-200 mb-2">
                        Song Description
                      </label>
                      <textarea
                        value={form.prompt}
                        onChange={(e) => updateForm(index, 'prompt', e.target.value)}
                        placeholder="Describe your song..."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
                        disabled={generating}
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-orange-200 mb-2">
                          Lyrics
                        </label>
                        <textarea
                          value={form.lyrics}
                          onChange={(e) => updateForm(index, 'lyrics', e.target.value)}
                          placeholder="Write some lyrics..."
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
                          disabled={generating}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-orange-200 mb-2">
                          Style
                        </label>
                        <input
                          type="text"
                          value={form.style}
                          onChange={(e) => updateForm(index, 'style', e.target.value)}
                          placeholder="e.g., pop, rock, jazz"
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                          disabled={generating}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-orange-200 mb-2">
                          Title <span className="font-normal text-gray-400">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={form.title}
                          onChange={(e) => updateForm(index, 'title', e.target.value)}
                          placeholder="Song title"
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                          disabled={generating}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}

              {forms.length < 10 && (
                <button
                  type="button"
                  onClick={addForm}
                  className="w-full py-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-orange-500 hover:text-orange-400 transition-all font-semibold"
                  disabled={generating}
                >
                  + Add Another Song
                </button>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={generating}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-white transition-all ${
                    generating 
                      ? 'bg-gray-700 cursor-not-allowed' 
                      : 'bg-orange-600 hover:bg-orange-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {generating ? 'Generating...' : `Generate ${forms.length} Song${forms.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Songs Section - Full Width */}
      <div className="w-full px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs by title or style... (e.g., ss.1 chill)"
              className="w-full px-5 py-3 bg-gray-800/50 border border-orange-500/30 text-gray-100 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-orange-100">
              Your Songs <span className="text-orange-400">({filteredSongs.length})</span>
            </h2>
            <div className="flex gap-3">
              {selectedSongs.size > 0 && (
                <>
                  <button
                    onClick={downloadSelected}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 rounded-xl font-semibold text-white transition-all"
                  >
                    Download ({selectedSongs.size})
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-gray-200 transition-all"
                  >
                    Deselect All
                  </button>
                </>
              )}
              {selectedSongs.size === 0 && filteredSongs.filter(s => s.status === 'complete').length > 0 && (
                <button
                  onClick={selectAll}
                  className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-gray-200 transition-all"
                >
                  Select All
                </button>
              )}
              <button
                onClick={loadSongs}
                className="px-5 py-2.5 bg-gray-800/50 border border-orange-500/30 rounded-xl font-semibold text-orange-200 hover:bg-gray-800 transition-all"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-gray-800/50 rounded-2xl border border-orange-500/20 p-12 text-center">
              <div className="animate-spin rounded-full h-14 w-14 border-b-3 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-400 font-medium">Loading songs...</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="bg-gray-800/50 rounded-2xl border border-orange-500/20 p-12 text-center">
              <p className="text-gray-400 text-lg">
                {searchQuery ? `No songs found matching "${searchQuery}"` : 'No songs yet. Create your first masterpiece!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredSongs.map((song) => (
                <div key={song.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5 hover:border-orange-500/50 transition-all relative">
                  
                  {/* Checkbox for selection - only show for complete songs */}
                  {song.status === 'complete' && song.audio_url && (
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedSongs.has(song.id)}
                        onChange={() => toggleSongSelection(song.id)}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-600 focus:ring-orange-500 focus:ring-2 cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 pl-8">
                      <h3 className="text-lg font-bold text-gray-100 mb-1 truncate">
                        {song.title || 'Untitled'}
                      </h3>
                      {song.metadata?.tags && (
                        <p className="text-sm text-gray-400 truncate">{song.metadata.tags}</p>
                      )}
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ml-2 ${getStatusColor(song.status)}`}>
                      {song.status}
                    </span>
                  </div>

                  {song.status === 'complete' && song.audio_url && (
                    <>
                      {song.image_url && (
                        <img src={song.image_url} alt={song.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                      )}
                      <audio 
                        controls 
                        className="w-full mb-3"
                      >
                        <source src={song.audio_url} type="audio/mpeg" />
                      </audio>
                      <button
                        onClick={() => downloadSingleSong(song.audio_url!, song.title)}
                        className="block w-full text-center bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all"
                      >
                        Download
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}