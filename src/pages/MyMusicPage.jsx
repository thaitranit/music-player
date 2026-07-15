import { useState, useEffect } from 'react';

function MyMusicPage({ user, onBack, onLogout }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingSong, setEditingSong] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    singer: '',
    album: '',
    genre: 'Pop',
    isPublic: true,
    musicFile: null
  });
  const [editForm, setEditForm] = useState({
    name: '',
    singer: '',
    album: '',
    genre: 'Pop',
    isPublic: true,
    image: ''
  });

  // Lấy tất cả bài hát (cho admin) hoặc bài hát của user
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const token = localStorage.getItem('token');
        let url = '/api/songs/user/my-songs';
        
        // Nếu là admin, lấy tất cả bài hát
        if (user?.isAdmin) {
          url = '/api/songs';
        }
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setSongs(data);
        }
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSongs();
    }
  }, [user]);

  // Xử lý upload file
  const handleFileChange = (e) => {
    setUploadForm({
      ...uploadForm,
      musicFile: e.target.files[0],
      // Tự động điền tên bài hát từ file name
      name: e.target.files[0] ? e.target.files[0].name.replace(/\.[^/.]+$/, '') : ''
    });
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUploadForm({
      ...uploadForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Xử lý thay đổi input edit
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Upload bài hát
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.musicFile) {
      setMessage('Vui lòng chọn file nhạc');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('musicFile', uploadForm.musicFile);
      formData.append('name', uploadForm.name);
      formData.append('singer', uploadForm.singer);
      formData.append('album', uploadForm.album);
      formData.append('genre', uploadForm.genre);
      formData.append('isPublic', uploadForm.isPublic);

      const response = await fetch('/api/songs/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Upload thành công!');
        // Reset form
        setUploadForm({
          name: '',
          singer: '',
          album: '',
          genre: 'Pop',
          isPublic: true,
          musicFile: null
        });
        // Refresh list
        const refreshUrl = user?.isAdmin ? '/api/songs' : '/api/songs/user/my-songs';
        const refreshResponse = await fetch(refreshUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setSongs(refreshData);
        }
      } else {
        setMessage(data.message || 'Upload thất bại');
      }
    } catch (error) {
      setMessage('Đã xảy ra lỗi');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  // Bắt đầu chỉnh sửa bài hát
  const handleStartEdit = (song) => {
    setEditingSong(song);
    setEditForm({
      name: song.name,
      singer: song.singer,
      album: song.album,
      genre: song.genre,
      isPublic: song.isPublic,
      image: song.image
    });
  };

  // Hủy chỉnh sửa
  const handleCancelEdit = () => {
    setEditingSong(null);
  };

  // Lưu chỉnh sửa
  const handleSaveEdit = async () => {
    if (!editingSong) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/songs/${editingSong.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Cập nhật thành công!');
        setEditingSong(null);
        // Refresh list
        const refreshUrl = user?.isAdmin ? '/api/songs' : '/api/songs/user/my-songs';
        const refreshResponse = await fetch(refreshUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setSongs(refreshData);
        }
      } else {
        setMessage(data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      setMessage('Đã xảy ra lỗi');
      console.error('Edit error:', error);
    }
  };

  // Xóa bài hát
  const handleDeleteSong = async (songId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài hát này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSongs(songs.filter(song => song.id !== songId));
        setMessage('Xóa bài hát thành công!');
      } else {
        const data = await response.json();
        setMessage(data.message || 'Xóa thất bại');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (!user) {
    return (
      <div className="d4t-container">
        <main className="d4t-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Vui lòng đăng nhập để quản lý nhạc</h2>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d4t-container">
        <main className="d4t-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div>Đang tải...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="d4t-container">
      {/* TOP HEADER */}
      <header className="d4t-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={onBack}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--d4t-text-secondary)', 
              fontSize: '20px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
            <i className="fas fa-arrow-left"></i>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Quay lại</span>
          </button>
          <div className="d4t-logo">
            <i className="fas fa-music"></i>
            <span>D4T MP3</span>
          </div>
          {user?.isAdmin && (
            <span style={{ 
              background: 'rgba(29, 185, 84, 0.2)', 
              color: 'var(--d4t-primary)', 
              padding: '4px 12px', 
              borderRadius: '500px', 
              fontSize: '12px',
              fontWeight: '600'
            }}>
              <i className="fas fa-crown" style={{ marginRight: '6px' }}></i>
              Admin
            </span>
          )}
        </div>

        <div className="d4t-header-right">
          <div className="d4t-user">
            <i className="fas fa-user-circle"></i>
            <span>{user.username}</span>
          </div>
          <button className="d4t-logout-btn" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="d4t-main" style={{ paddingTop: '24px' }}>
        <h1 className="d4t-section-title" style={{ fontSize: '28px', marginBottom: '32px' }}>
          {user?.isAdmin ? 'Quản lý tất cả nhạc' : 'Quản lý nhạc của tôi'}
        </h1>

        {/* Upload Form */}
        <div style={{ background: 'var(--d4t-dark-surface-light)', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Upload bài hát mới</h2>
          
          {message && (
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              background: message.includes('thành công') ? 'rgba(29, 185, 84, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.includes('thành công') ? 'var(--d4t-primary)' : '#ef4444',
              border: message.includes('thành công') ? '1px solid rgba(29, 185, 84, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--d4t-text-secondary)', fontSize: '14px' }}>
                  Tên bài hát *
                </label>
                <input
                  type="text"
                  name="name"
                  value={uploadForm.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--d4t-dark-surface)',
                    border: '1px solid var(--d4t-border)',
                    borderRadius: '8px',
                    color: 'var(--d4t-text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--d4t-text-secondary)', fontSize: '14px' }}>
                  Ca sĩ *
                </label>
                <input
                  type="text"
                  name="singer"
                  value={uploadForm.singer}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--d4t-dark-surface)',
                    border: '1px solid var(--d4t-border)',
                    borderRadius: '8px',
                    color: 'var(--d4t-text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--d4t-text-secondary)', fontSize: '14px' }}>
                  Album
                </label>
                <input
                  type="text"
                  name="album"
                  value={uploadForm.album}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--d4t-dark-surface)',
                    border: '1px solid var(--d4t-border)',
                    borderRadius: '8px',
                    color: 'var(--d4t-text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--d4t-text-secondary)', fontSize: '14px' }}>
                  Thể loại
                </label>
                <select
                  name="genre"
                  value={uploadForm.genre}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--d4t-dark-surface)',
                    border: '1px solid var(--d4t-border)',
                    borderRadius: '8px',
                    color: 'var(--d4t-text-primary)',
                    outline: 'none'
                  }}
                >
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="R&B">R&B</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Ballad">Ballad</option>
                  <option value="V-Pop">V-Pop</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--d4t-text-secondary)', fontSize: '14px' }}>
                File nhạc * (MP3, WAV, OGG, FLAC, M4A - Tối đa 50MB)
              </label>
              <input
                type="file"
                name="musicFile"
                accept="audio/*"
                onChange={handleFileChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--d4t-dark-surface)',
                  border: '1px solid var(--d4t-border)',
                  borderRadius: '8px',
                  color: 'var(--d4t-text-primary)'
                }}
              />
              {uploadForm.musicFile && (
                <div style={{ marginTop: '8px', color: 'var(--d4t-text-secondary)', fontSize: '13px' }}>
                  Đã chọn: {uploadForm.musicFile.name}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={uploadForm.isPublic}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: 'var(--d4t-text-secondary)' }}>
                  Công khai (mọi người đều có thể nghe)
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              style={{
                padding: '12px 32px',
                background: 'var(--d4t-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '500px',
                fontWeight: '600',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.7 : 1
              }}
            >
              {uploading ? 'Đang upload...' : 'Upload bài hát'}
            </button>
          </form>
        </div>

        {/* Edit Form */}
        {editingSong && (
          <div style={{ background: 'var(--d4t-dark-surface-light)', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Chỉnh sửa bài hát</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--d4t-text-secondary)', fontSize: '14px' }}>
                  Tên bài hát
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--d4t-dark-surface)',
                    border: '1px solid var(--d4t-border)',
                    borderRadius: '8px',
                    color: 'var(--d4t-text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--d4t-text-secondary)', fontSize: '14px' }}>
                  Ca sĩ
                </label>
                <input
                  type="text"
                  name="singer"
                  value={editForm.singer}
                  onChange={handleEditInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--d4t-dark-surface)',
                    border: '1px solid var(--d4t-border)',
                    borderRadius: '8px',
                    color: 'var(--d4t-text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--d4t-text-secondary)', fontSize: '14px' }}>
                  Album
                </label>
                <input
                  type="text"
                  name="album"
                  value={editForm.album}
                  onChange={handleEditInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--d4t-dark-surface)',
                    border: '1px solid var(--d4t-border)',
                    borderRadius: '8px',
                    color: 'var(--d4t-text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--d4t-text-secondary)', fontSize: '14px' }}>
                  Thể loại
                </label>
                <select
                  name="genre"
                  value={editForm.genre}
                  onChange={handleEditInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--d4t-dark-surface)',
                    border: '1px solid var(--d4t-border)',
                    borderRadius: '8px',
                    color: 'var(--d4t-text-primary)',
                    outline: 'none'
                  }}
                >
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="R&B">R&B</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Ballad">Ballad</option>
                  <option value="V-Pop">V-Pop</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--d4t-text-secondary)', fontSize: '14px' }}>
                  URL ảnh bìa
                </label>
                <input
                  type="text"
                  name="image"
                  value={editForm.image}
                  onChange={handleEditInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--d4t-dark-surface)',
                    border: '1px solid var(--d4t-border)',
                    borderRadius: '8px',
                    color: 'var(--d4t-text-primary)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={editForm.isPublic}
                  onChange={handleEditInputChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: 'var(--d4t-text-secondary)' }}>
                  Công khai (mọi người đều có thể nghe)
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: '12px 32px',
                  background: 'var(--d4t-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '500px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Lưu thay đổi
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '12px 32px',
                  background: 'var(--d4t-dark-surface)',
                  color: 'var(--d4t-text-primary)',
                  border: '1px solid var(--d4t-border)',
                  borderRadius: '500px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Danh sách bài hát */}
        <div>
          <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>
            {user?.isAdmin ? 'Tất cả bài hát' : 'Bài hát của bạn'} ({songs.length})
          </h2>
          
          {songs.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              color: 'var(--d4t-text-secondary)',
              background: 'var(--d4t-dark-surface-light)',
              borderRadius: '12px'
            }}>
              {user?.isAdmin ? 'Chưa có bài hát nào.' : 'Bạn chưa có bài hát nào. Hãy upload bài hát đầu tiên!'}
            </div>
          ) : (
            <div className="d4t-song-list">
              {songs.map((song, index) => (
                <div key={song.id} className="d4t-song-item" style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="d4t-song-num" style={{ width: '50px', textAlign: 'center' }}>
                    {index + 1}
                  </div>
                  <img src={song.image} alt={song.name} className="d4t-song-thumb" />
                  <div className="d4t-song-info">
                    <div className="d4t-song-name">{song.name}</div>
                    <div className="d4t-song-singer">{song.singer}</div>
                  </div>
                  <div className="d4t-song-album">{song.album}</div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      padding: '4px 10px', 
                      borderRadius: '500px', 
                      background: song.isPublic ? 'rgba(29, 185, 84, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: song.isPublic ? 'var(--d4t-primary)' : 'var(--d4t-text-tertiary)'
                    }}>
                      {song.isPublic ? 'Công khai' : 'Riêng tư'}
                    </span>
                    <span style={{ color: 'var(--d4t-text-tertiary)', fontSize: '14px' }}>
                      {song.plays} lượt nghe
                    </span>
                    {user?.isAdmin && (
                      <>
                        <button
                          onClick={() => handleStartEdit(song)}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song.id)}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MyMusicPage;
