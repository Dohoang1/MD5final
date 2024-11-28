import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AddSongForm.css';

const AddSongForm = ({ onSongAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    singer: '',
    composer: '',
    duration: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let tempErrors = {};
    
    if (!formData.name.trim()) {
      tempErrors.name = 'Vui lòng nhập tên bài hát';
    }

    if (!formData.singer.trim()) {
      tempErrors.singer = 'Vui lòng nhập tên ca sĩ';
    } else if (formData.singer.length > 30) {
      tempErrors.singer = 'Tên ca sĩ không được quá 30 ký tự';
    }

    if (!formData.composer.trim()) {
      tempErrors.composer = 'Vui lòng nhập tên nhạc sĩ';
    } else if (formData.composer.length > 30) {
      tempErrors.composer = 'Tên nhạc sĩ không được quá 30 ký tự';
    }

    if (!formData.duration.trim()) {
      tempErrors.duration = 'Vui lòng nhập thời lượng';
    } else if (!/^([0-9]{2}):([0-5][0-9])$/.test(formData.duration)) {
      tempErrors.duration = 'Thời lượng phải có định dạng mm:ss';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const newSong = {
          ...formData,
          likes: 0,
          status: 'stored'
        };

        const response = await axios.post('http://localhost:3001/songs', newSong);
        onSongAdded(response.data);
        setFormData({ name: '', singer: '', composer: '', duration: '' });
      } catch (error) {
        console.error('Error adding song:', error);
        toast.error('Có lỗi xảy ra khi thêm bài hát! 😢', {
          position: "top-right",
          autoClose: 3000
        });
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="add-song-form">
      <h2>Thêm Bài Hát Mới</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="name"
            placeholder="Tên bài hát"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="singer"
            placeholder="Ca sĩ"
            value={formData.singer}
            onChange={handleChange}
          />
          {errors.singer && <span className="error">{errors.singer}</span>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="composer"
            placeholder="Nhạc sĩ"
            value={formData.composer}
            onChange={handleChange}
          />
          {errors.composer && <span className="error">{errors.composer}</span>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="duration"
            placeholder="Thời lượng (mm:ss)"
            value={formData.duration}
            onChange={handleChange}
          />
          {errors.duration && <span className="error">{errors.duration}</span>}
        </div>

        <button type="submit">Thêm bài hát</button>
      </form>
    </div>
  );
};

export default AddSongForm;