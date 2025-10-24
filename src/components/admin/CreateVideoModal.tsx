import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../api/http';

interface Lesson {
  _id: string;
  title: string;
}

interface Video {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  lesson?: {
    _id: string;
    title: string;
  };
  duration?: number;
  order: number;
  isActive: boolean;
}

interface CreateVideoModalProps {
  onClose: () => void;
  onSuccess: () => void;
  editVideo?: Video | null;
}

export default function CreateVideoModal({ onClose, onSuccess, editVideo }: CreateVideoModalProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    lesson: '',
    duration: 0,
    order: 0,
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLessons();
    if (editVideo) {
      setFormData({
        title: editVideo.title,
        description: editVideo.description || '',
        videoUrl: editVideo.videoUrl,
        lesson: editVideo.lesson?._id || '',
        duration: editVideo.duration || 0,
        order: editVideo.order,
        isActive: editVideo.isActive
      });
    }
  }, [editVideo]);

  const fetchLessons = async () => {
    try {
      const { data } = await api.get('/api/lessons');
      setLessons(data || []);
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editVideo) {
        await api.put(`/api/videos/${editVideo._id}`, formData);
      } else {
        await api.post('/api/videos', formData);
      }
      onSuccess();
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editVideo ? 'Chỉnh sửa video' : 'Thêm video mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tiêu đề video"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập mô tả video"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={formData.videoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bài học <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.lesson}
              onChange={(e) => setFormData(prev => ({ ...prev, lesson: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Chọn bài học --</option>
              {lessons.map(lesson => (
                <option key={lesson._id} value={lesson._id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời lượng (phút)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thứ tự
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Video hoạt động
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (editVideo ? 'Đang cập nhật...' : 'Đang tạo...') : (editVideo ? 'Cập nhật video' : 'Tạo video')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

