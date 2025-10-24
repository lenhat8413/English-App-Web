import { useEffect, useState } from 'react';
import { 
  Video as VideoIcon,
  Plus,
  Trash2,
  Play,
  Eye,
  EyeOff,
  Search,
  BookOpen,
  Clock,
  Edit2
} from 'lucide-react';
import { apiCall } from '../../utils/api';
import CreateVideoModal from '../../components/admin/CreateVideoModal';

interface Video {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  lesson?: {
    _id: string;
    title: string;
    level: number;
  };
  isActive: boolean;
  order: number;
  createdAt: string;
}

interface Lesson {
  _id: string;
  title: string;
  description?: string;
  level: number;
  isActive: boolean;
  order: number;
}

const AdminVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    if (selectedLessonId) {
      fetchVideosByLesson(selectedLessonId);
    }
  }, [selectedLessonId]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall('/api/lessons');
      const data = await response.json();
      console.log('✅ Lessons fetched:', data);
      setLessons(data);
      
      if (data.length > 0) {
        setSelectedLessonId(data[0]._id);
      }
    } catch (err: any) {
      console.error('❌ Error fetching lessons:', err);
      setError(err.message || 'Failed to fetch lessons');
    } finally {
      setLoading(false);
    }
  };

  const fetchVideosByLesson = async (lessonId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(`/api/videos/lesson/${lessonId}`);
      const data = await response.json();
      console.log('✅ Videos fetched for lesson:', data);
      setVideos(data);
    } catch (err: any) {
      console.error('❌ Error fetching videos:', err);
      setError(err.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, videoTitle: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa video "${videoTitle}" không?`)) return;
    
    try {
      await apiCall(`/api/videos/${id}`, { method: 'DELETE' });
      if (selectedLessonId) {
        fetchVideosByLesson(selectedLessonId);
      }
      alert('✅ Đã xóa video thành công!');
    } catch (err: any) {
      alert('❌ Không thể xóa video: ' + err.message);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getYouTubeThumbnail = (url: string) => {
    try {
      const videoId = url.includes('youtube.com/watch')
        ? url.split('v=')[1]?.split('&')[0]
        : url.includes('youtu.be/')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : null;
      
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    } catch (e) {
      console.error('Error extracting thumbnail:', e);
    }
    return '';
  };

  const selectedLesson = lessons.find(l => l._id === selectedLessonId);

  const filteredVideos = videos.filter(video =>
    searchQuery === '' ||
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && lessons.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Đang tải dữ liệu...</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <VideoIcon className="text-orange-600" size={28} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý Video</h1>
              </div>
              <p className="text-gray-600">Quản lý tất cả video học tập theo bài học</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <Plus size={20} />
              Thêm video mới
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Lesson Selector */}
        {lessons.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              📚 Chọn Lesson để quản lý video:
            </label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {lessons.map((lesson) => (
                <option key={lesson._id} value={lesson._id}>
                  {lesson.title} (Level {lesson.level}) - Order: {lesson.order}
                </option>
              ))}
            </select>
            
            {selectedLesson && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <BookOpen className="text-orange-600 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="font-bold text-orange-900">{selectedLesson.title}</p>
                    {selectedLesson.description && (
                      <p className="text-sm text-orange-700 mt-1">{selectedLesson.description}</p>
                    )}
                    <p className="text-xs text-orange-600 mt-2">
                      Level {selectedLesson.level} • Order {selectedLesson.order}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            ⚠️ Chưa có lesson nào. Vui lòng tạo lesson trước!
          </div>
        )}

        {/* Search & Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm video..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>Tổng: <span className="font-semibold text-gray-900">{videos.length}</span></span>
              <span>Hiển thị: <span className="font-semibold text-gray-900">{filteredVideos.length}</span></span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!selectedLessonId ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <VideoIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">Vui lòng chọn lesson để xem videos.</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <VideoIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'Không tìm thấy video nào' : 'Lesson này chưa có video nào.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div 
                key={video._id} 
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden group"
              >
                {/* Thumbnail */}
                <div className="relative bg-gray-900 h-48 overflow-hidden">
                  {(video.thumbnailUrl || getYouTubeThumbnail(video.videoUrl)) ? (
                    <img
                      src={video.thumbnailUrl || getYouTubeThumbnail(video.videoUrl)}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <VideoIcon className="text-gray-600" size={48} />
                    </div>
                  )}
                  
                  {/* Duration badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      <Clock size={12} />
                      {formatDuration(video.duration)}
                    </div>
                  )}

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <Play className="text-orange-600" size={24} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900">
                    {video.title}
                  </h3>
                  
                  {video.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {video.description}
                    </p>
                  )}

                  {/* Lesson info */}
                  {video.lesson && (
                    <div className="flex items-center gap-1 mb-3 text-xs text-gray-500">
                      <BookOpen size={12} />
                      {video.lesson.title} (Level {video.lesson.level})
                    </div>
                  )}

                  {/* Status & Order */}
                  <div className="flex items-center gap-2 mb-4">
                    {video.isActive ? (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        <Eye size={12} />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                        <EyeOff size={12} />
                        Inactive
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Order: <span className="font-semibold">{video.order}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingVideo(video);
                        setShowCreateModal(true);
                      }}
                      className="flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm px-3 py-2 rounded-lg transition-colors font-medium"
                    >
                      <Play size={16} />
                      Xem
                    </a>
                    <button
                      onClick={() => handleDelete(video._id, video.title)}
                      className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Video Modal */}
      {showCreateModal && (
        <CreateVideoModal
          onClose={() => {
            setShowCreateModal(false);
            setEditingVideo(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingVideo(null);
            if (selectedLessonId) {
              fetchVideosByLesson(selectedLessonId);
            }
          }}
          editVideo={editingVideo}
        />
      )}
    </div>
  );
};

export default AdminVideos;