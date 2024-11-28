import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import AddSongForm from './AddSongForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './SongList.css';

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [originalSongs, setOriginalSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [playingSong, setPlayingSong] = useState(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3001/songs');
      setSongs(response.data);
      setOriginalSongs(response.data);
      setError(null);
      toast.success('Tải dữ liệu thành công! 🎵', {
        position: "top-right",
        autoClose: 2000
      });
    } catch (error) {
      setError('Có lỗi xảy ra khi tải dữ liệu!');
      toast.error('Không thể tải dữ liệu! 😢', {
        position: "top-right",
        autoClose: 3000
      });
      console.error('Error fetching songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      setSongs(originalSongs);
      return;
    }

    const filteredSongs = originalSongs.filter(song =>
      song.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      song.singer.toLowerCase().includes(searchValue.toLowerCase()) ||
      song.composer.toLowerCase().includes(searchValue.toLowerCase())
    );

    setSongs(filteredSongs);
  };

  // Xử lý thêm bài hát mới
  const handleSongAdded = (newSong) => {
    setSongs(prevSongs => [...prevSongs, newSong]);
    setOriginalSongs(prevSongs => [...prevSongs, newSong]);
    setShowAddForm(false);
    toast.success('Thêm bài hát thành công! 🎵', {
      position: "top-right",
      autoClose: 3000
    });
  };

  // Xử lý click vào tên bài hát
  const handleSongClick = (song) => {
    setPlayingSong(song);
    toast.info(`Đang phát: ${song.name} - ${song.singer} 🎧`, {
      position: "bottom-left",
      autoClose: 2000
    });
  };

  // Xử lý hiển thị modal xác nhận công khai
  const handlePublishClick = (song) => {
    setSelectedSong(song);
    setShowModal(true);
  };

  // Xử lý xác nhận công khai bài hát
  const handleConfirmPublish = async () => {
    try {
      await axios.patch(`http://localhost:3001/songs/${selectedSong.id}`, {
        status: 'public'
      });

      const updatedSongs = songs.map(song => 
        song.id === selectedSong.id ? { ...song, status: 'public' } : song
      );
      setSongs(updatedSongs);
      setOriginalSongs(updatedSongs);

      setShowModal(false);
      toast.success('Công khai bài hát thành công! 🚀', {
        position: "top-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error publishing song:', error);
      toast.error('Có lỗi xảy ra khi công khai bài hát! 😢', {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  if (isLoading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="song-list">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <h1>Kho Nhạc</h1>

      <div className="controls">
        {playingSong && (
          <div className="now-playing">
            <div className="now-playing-label">
              <span className="playing-icon">▶</span>
              Đang phát
            </div>
            <div className="now-playing-info">
              {playingSong.name} - {playingSong.singer}
            </div>
          </div>
        )}

        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm bài hát, ca sĩ hoặc nhạc sĩ..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <button 
          className="add-button"
          onClick={() => {
            setShowAddForm(!showAddForm);
          }}
        >
          {showAddForm ? 'Ẩn form' : 'Thêm bài hát'}
        </button>
      </div>

      {showAddForm && (
        <AddSongForm onSongAdded={handleSongAdded} />
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên bài hát</th>
              <th>Ca sĩ</th>
              <th>Nhạc sĩ</th>
              <th>Thời lượng</th>
              <th>Lượt thích</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {songs.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  {searchTerm ? 'Không tìm thấy bài hát phù hợp' : 'Chưa có bài hát nào'}
                </td>
              </tr>
            ) : (
              songs.map((song, index) => (
                <tr key={song.id}>
                  <td>{index + 1}</td>
                  <td>
                    <span 
                      className="song-name-link"
                      onClick={() => handleSongClick(song)}
                    >
                      {song.name}
                    </span>
                  </td>
                  <td>{song.singer}</td>
                  <td>{song.composer}</td>
                  <td>{song.duration}</td>
                  <td>{song.likes}</td>
                  <td>{song.status === 'public' ? 'Công khai' : 'Lưu trữ'}</td>
                  <td>
                    {song.status === 'stored' && (
                      <button
                        className="publish-button"
                        onClick={() => handlePublishClick(song)}
                      >
                        Công khai
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận công khai</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn công khai bài hát "{selectedSong?.name}" không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="success" onClick={handleConfirmPublish}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SongList;