import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookMarked, Brain, ArrowRight } from 'lucide-react';
import { getLessonById } from '../../api/lessonsApi';
import { getTopicsByLesson, createTopic, deleteTopic } from '../../api/topicsApi';

interface Topic {
  _id: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
}

interface Lesson {
  _id: string;
  title: string;
  description: string;
  level: number | string;
}

const LessonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchLesson();
      fetchTopics();
    }
  }, [id]);

  const fetchLesson = async () => {
    try {
      const res = await getLessonById(id!);
      setLesson(res.data);
    } catch (err) {
      console.error(err);
      alert('Không thể tải thông tin bài học');
    }
  };

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await getTopicsByLesson(id!);
      setTopics(res.data);
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách chủ đề');
    } finally {
      setLoading(false);
    }
  };

 const handleCreateTopic = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    setLoading(true);
    await createTopic({
      ...formData,
      lessonId: id, // ✅ Đúng theo backend yêu cầu
    });
    setShowForm(false);
    setFormData({ title: '', description: '', order: 1 });
    fetchTopics();
  } catch (err) {
    console.error(err);
    alert('Không thể tạo chủ đề');
  } finally {
    setLoading(false);
  }
};



  const handleDeleteTopic = async (topicId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa chủ đề này không?')) return;
    try {
      await deleteTopic(topicId);
      fetchTopics();
    } catch {
      alert('Không thể xóa chủ đề.');
    }
  };

  if (!lesson) return <p className="p-6 text-gray-500">Đang tải thông tin bài học...</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">📖 {lesson.title}</h1>
          <p className="text-gray-500">{lesson.description}</p>
        </div>
        <button
          onClick={() => navigate('/teacher/lessons')}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
        >
          ⬅ Quay lại
        </button>
      </div>

      {/* Quick Links to Vocabulary & Quizzes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <BookMarked className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quản lý từ vựng</h3>
                <p className="text-sm text-gray-600">Thêm và chỉnh sửa từ vựng cho bài học</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/teacher/vocabularies?lesson=${id}`)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Mở
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Brain className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quản lý Quiz</h3>
                <p className="text-sm text-gray-600">Tạo và chỉnh sửa câu hỏi cho bài học</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/teacher/quizzes?lesson=${id}`)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Mở
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Create Topic */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-medium">📚 Danh sách chủ đề</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'Đóng' : '+ Thêm chủ đề'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateTopic} className="bg-gray-50 p-4 rounded shadow mb-6">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-600 mb-1">Tên chủ đề</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-600 mb-1">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="border p-2 w-full rounded"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Thứ tự</label>
            <input
              type="number"
              value={formData.order}
              onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
              className="border p-2 w-24 rounded"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {loading ? 'Đang tạo...' : 'Tạo chủ đề'}
          </button>
        </form>
      )}

      {/* Topics Table */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200 shadow-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">#</th>
              <th className="border px-3 py-2 text-left">Tên chủ đề</th>
              <th className="border px-3 py-2 text-left">Mô tả</th>
              <th className="border px-3 py-2 text-center">Thứ tự</th>
              <th className="border px-3 py-2 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic, index) => (
              <tr key={topic._id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{index + 1}</td>
                <td
                  onClick={() => navigate(`/teacher/topics/${topic._id}`)}
                  className="border px-3 py-2 text-blue-600 cursor-pointer hover:underline"
                >
                  {topic.title}
                </td>
                <td className="border px-3 py-2">{topic.description}</td>
                <td className="border px-3 py-2 text-center">{topic.order}</td>
                <td className="border px-3 py-2 text-center">
                  <button
                    onClick={() => handleDeleteTopic(topic._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LessonDetail;