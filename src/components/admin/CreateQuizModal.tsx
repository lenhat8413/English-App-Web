import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '../../api/http';

interface Lesson {
  _id: string;
  title: string;
  level: number;
}

interface Quiz {
  _id: string;
  lesson?: {
    _id: string;
    title: string;
  };
  question?: string;
  title?: string;
  type: 'multiple_choice' | 'fill_blank' | 'true_false' | 'matching';
  options?: string[];
  correctAnswer: string | string[];
  pairs?: { left: string; right: string }[];
  explanation?: string;
  timeLimit?: number;
  passingScore?: number;
  isActive: boolean;
}

interface CreateQuizModalProps {
  onClose: () => void;
  onSuccess: () => void;
  editQuiz?: Quiz | null;
}

export default function CreateQuizModal({ onClose, onSuccess, editQuiz }: CreateQuizModalProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [formData, setFormData] = useState({
    lesson: '',
    question: '',
    type: 'multiple_choice' as Quiz['type'],
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    timeLimit: 30,
    passingScore: 70,
    isActive: true,
    pairs: [{ left: '', right: '' }]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLessons();
    if (editQuiz) {
      setFormData({
        lesson: editQuiz.lesson?._id || '',
        question: editQuiz.question,
        type: editQuiz.type,
        options: editQuiz.options || ['', '', '', ''],
        correctAnswer: Array.isArray(editQuiz.correctAnswer) ? editQuiz.correctAnswer.join(', ') : editQuiz.correctAnswer,
        explanation: editQuiz.explanation || '',
        timeLimit: editQuiz.timeLimit || 30,
        passingScore: editQuiz.passingScore || 70,
        isActive: editQuiz.isActive,
        pairs: editQuiz.pairs && editQuiz.pairs.length > 0 ? editQuiz.pairs : [{ left: '', right: '' }]
      });
    }
  }, [editQuiz]);

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
      const payload: any = {
        lesson: formData.lesson,
        question: formData.question,
        type: formData.type,
        explanation: formData.explanation,
        timeLimit: formData.timeLimit,
        passingScore: formData.passingScore,
        isActive: formData.isActive,
      };

      // Type-specific handling
      if (formData.type === 'multiple_choice') {
        payload.options = formData.options.filter(o => o.trim());
        payload.correctAnswer = formData.correctAnswer;
      } else if (formData.type === 'fill_blank') {
        payload.correctAnswer = formData.correctAnswer;
      } else if (formData.type === 'true_false') {
        payload.correctAnswer = formData.correctAnswer;
      } else if (formData.type === 'matching') {
        payload.pairs = formData.pairs.filter(p => p.left.trim() && p.right.trim());
        payload.correctAnswer = payload.pairs.map((p: any) => `${p.left}=${p.right}`).join('\n');
      }

      if (editQuiz) {
        await api.put(`/api/quizzes/${editQuiz._id}`, payload);
      } else {
        await api.post('/api/quizzes', payload);
      }
      
      onSuccess();
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const addPair = () => {
    setFormData(prev => ({
      ...prev,
      pairs: [...prev.pairs, { left: '', right: '' }]
    }));
  };

  const removePair = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pairs: prev.pairs.filter((_, i) => i !== index)
    }));
  };

  const updatePair = (index: number, field: 'left' | 'right', value: string) => {
    setFormData(prev => ({
      ...prev,
      pairs: prev.pairs.map((pair, i) => 
        i === index ? { ...pair, [field]: value } : pair
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {editQuiz ? 'Chỉnh sửa Quiz' : 'Tạo Quiz mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Lesson */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bài học <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.lesson}
                onChange={(e) => setFormData(prev => ({ ...prev, lesson: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">-- Chọn bài học --</option>
                {lessons.map(lesson => (
                  <option key={lesson._id} value={lesson._id}>
                    {lesson.title} (Level {lesson.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Question */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Câu hỏi <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="Nhập câu hỏi..."
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại câu hỏi <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Quiz['type'] }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="multiple_choice">Multiple Choice (Trắc nghiệm)</option>
                <option value="fill_blank">Fill in the Blank (Điền từ)</option>
                <option value="true_false">True/False (Đúng/Sai)</option>
                <option value="matching">Matching (Ghép cặp)</option>
              </select>
            </div>

            {/* Type-specific fields */}
            {formData.type === 'multiple_choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Các lựa chọn
                </label>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={`Lựa chọn ${index + 1}`}
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                >
                  <Plus size={16} />
                  Thêm lựa chọn
                </button>
              </div>
            )}

            {formData.type === 'matching' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Các cặp ghép
                </label>
                {formData.pairs.map((pair, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={pair.left}
                      onChange={(e) => updatePair(index, 'left', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Từ tiếng Anh"
                    />
                    <input
                      type="text"
                      value={pair.right}
                      onChange={(e) => updatePair(index, 'right', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nghĩa tiếng Việt"
                    />
                    {formData.pairs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePair(index)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPair}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                >
                  <Plus size={16} />
                  Thêm cặp
                </button>
              </div>
            )}

            {/* Correct Answer */}
            {formData.type !== 'matching' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đáp án đúng <span className="text-red-500">*</span>
                </label>
                {formData.type === 'true_false' ? (
                  <select
                    required
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn đáp án --</option>
                    <option value="true">True (Đúng)</option>
                    <option value="false">False (Sai)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={formData.type === 'fill_blank' ? 'Nhập đáp án...' : 'Nhập đáp án chính xác...'}
                  />
                )}
              </div>
            )}

            {/* Explanation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giải thích
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={2}
                placeholder="Giải thích đáp án..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Time Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian (giây)
                </label>
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min={5}
                  max={300}
                />
              </div>

              {/* Passing Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm đạt (%)
                </label>
                <input
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData(prev => ({ ...prev, passingScore: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min={0}
                  max={100}
                />
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label className="text-sm text-gray-700">
                Kích hoạt quiz
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-4 mt-8">
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
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (editQuiz ? 'Đang cập nhật...' : 'Đang tạo...') : (editQuiz ? 'Cập nhật Quiz' : 'Tạo Quiz')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}










