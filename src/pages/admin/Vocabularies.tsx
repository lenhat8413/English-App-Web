import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, BookOpen, Volume2, Upload, FileText } from 'lucide-react';
import api from '../../api/http';
import mammoth from 'mammoth';

interface Lesson {
  _id: string;
  title: string;
}

interface Vocabulary {
  _id: string;
  word: string;
  meaning: string;
  phonetic?: string;
  pronunciationUS?: string;
  pronunciationUK?: string;
  partOfSpeech?: string;
  stress?: string;
  example?: string;
  exampleTranslation?: string;
  synonyms?: string[];
  antonyms?: string[];
  lesson?: { _id: string; title: string };
  level?: string;
  imageUrl?: string;
  createdAt?: string;
}

export default function AdminVocabularies() {
  const [searchParams] = useSearchParams();
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null);
  
  // Filters - get lesson from URL params if present
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLesson, setFilterLesson] = useState(searchParams.get('lesson') || '');
  const [filterLevel, setFilterLevel] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<Partial<Vocabulary>>({
    word: '',
    meaning: '',
    phonetic: '',
    pronunciationUS: '',
    pronunciationUK: '',
    partOfSpeech: 'noun',
    stress: '',
    example: '',
    exampleTranslation: '',
    synonyms: [],
    antonyms: [],
    lesson: undefined,
    level: 'A1',
    imageUrl: ''
  });

  // Bulk form state
  const [bulkData, setBulkData] = useState({
    text: '',
    lesson: '',
    level: 'A1',
    partOfSpeech: 'noun'
  });

  // File upload state
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileData, setFileData] = useState({
    lesson: '',
    level: 'A1',
    partOfSpeech: 'noun'
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    fetchData();
  }, [searchTerm, filterLesson, filterLevel]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterLesson) params.append('lesson', filterLesson);
      if (filterLevel) params.append('level', filterLevel);
      
      const [vocabsRes, lessonsRes] = await Promise.all([
        api.get(`/api/vocab?${params.toString()}`),
        api.get('/api/lessons')
      ]);
      
      setVocabularies(vocabsRes.data.vocabs || vocabsRes.data);
      setLessons(lessonsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vocab?: Vocabulary) => {
    if (vocab) {
      setEditingVocab(vocab);
      setFormData({
        word: vocab.word,
        meaning: vocab.meaning,
        phonetic: vocab.phonetic || '',
        pronunciationUS: vocab.pronunciationUS || '',
        pronunciationUK: vocab.pronunciationUK || '',
        partOfSpeech: vocab.partOfSpeech || 'noun',
        stress: vocab.stress || '',
        example: vocab.example || '',
        exampleTranslation: vocab.exampleTranslation || '',
        synonyms: vocab.synonyms || [],
        antonyms: vocab.antonyms || [],
        lesson: vocab.lesson?._id as any,
        level: vocab.level || 'A1',
        imageUrl: vocab.imageUrl || ''
      });
    } else {
      setEditingVocab(null);
      setFormData({
        word: '',
        meaning: '',
        phonetic: '',
        pronunciationUS: '',
        pronunciationUK: '',
        partOfSpeech: 'noun',
        stress: '',
        example: '',
        exampleTranslation: '',
        synonyms: [],
        antonyms: [],
        lesson: undefined,
        level: 'A1',
        imageUrl: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingVocab) {
        // Update
        await api.put(`/api/vocab/${editingVocab._id}`, formData);
      } else {
        // Create
        await api.post('/api/vocab', formData);
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save vocabulary:', err);
      alert('Không thể lưu từ vựng. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa từ vựng này?')) return;
    
    try {
      await api.delete(`/api/vocab/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete vocabulary:', err);
      alert('Không thể xóa từ vựng. Vui lòng thử lại.');
    }
  };

  const handleArrayInput = (field: 'synonyms' | 'antonyms', value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkData.text.trim()) {
      alert('Vui lòng nhập danh sách từ vựng');
      return;
    }

    try {
      // Parse the bulk text
      const lines = bulkData.text
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      const vocabs = lines.map(line => {
        const parts = line.split('\t').map(part => part.trim());
        return {
          word: parts[0] || '',
          meaning: parts[1] || '',
          phonetic: parts[2] || '',
          example: parts[3] || '',
          exampleTranslation: parts[4] || '',
          partOfSpeech: bulkData.partOfSpeech,
          level: bulkData.level,
          lesson: bulkData.lesson || undefined,
          synonyms: [],
          antonyms: []
        };
      });

      // Validate required fields
      const invalidVocabs = vocabs.filter(v => !v.word || !v.meaning);
      if (invalidVocabs.length > 0) {
        alert(`Có ${invalidVocabs.length} từ vựng thiếu thông tin bắt buộc (từ vựng và nghĩa)`);
        return;
      }

      // Send to backend
      await api.post('/api/vocab/bulk-import', { vocabs });
      
      setShowBulkModal(false);
      setBulkData({ text: '', lesson: '', level: 'A1', partOfSpeech: 'noun' });
      fetchData();
      alert(`✅ Đã thêm thành công ${vocabs.length} từ vựng!`);
    } catch (err) {
      console.error('Failed to bulk import vocabularies:', err);
      alert('Không thể thêm từ vựng. Vui lòng thử lại.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      alert('Vui lòng chọn file .docx');
      return;
    }

    setUploadedFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (!result.value || result.value.trim().length === 0) {
        alert('File không có nội dung hoặc không thể đọc được. Vui lòng kiểm tra file có phải là file Word thực sự không.');
        return;
      }
      
      setFileContent(result.value);
    } catch (err) {
      console.error('Error reading file:', err);
      alert('Không thể đọc file DOCX. Vui lòng đảm bảo:\n1. File là file Word thực sự (.docx)\n2. File không bị hỏng\n3. File có nội dung text\n\nBạn có thể tạo file DOCX bằng cách:\n1. Mở Microsoft Word\n2. Copy nội dung từ file vocab-demo.txt\n3. Paste vào Word và lưu với định dạng .docx');
    }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileContent.trim()) {
      alert('Không có nội dung để xử lý');
      return;
    }

    try {
      // Parse the file content
      const lines = fileContent
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      const vocabs = lines.map(line => {
        // Try different separators
        const parts = line.split(/\t|,|\|/).map(part => part.trim());
        return {
          word: parts[0] || '',
          meaning: parts[1] || '',
          phonetic: parts[2] || '',
          example: parts[3] || '',
          exampleTranslation: parts[4] || '',
          partOfSpeech: fileData.partOfSpeech,
          level: fileData.level,
          lesson: fileData.lesson || undefined,
          synonyms: [],
          antonyms: []
        };
      });

      // Validate required fields
      const invalidVocabs = vocabs.filter(v => !v.word || !v.meaning);
      if (invalidVocabs.length > 0) {
        alert(`Có ${invalidVocabs.length} từ vựng thiếu thông tin bắt buộc (từ vựng và nghĩa)`);
        return;
      }

      // Send to backend
      await api.post('/api/vocab/bulk-import', { vocabs });
      
      setShowFileModal(false);
      setFileData({ lesson: '', level: 'A1', partOfSpeech: 'noun' });
      setUploadedFile(null);
      setFileContent('');
      fetchData();
      alert(`✅ Đã thêm thành công ${vocabs.length} từ vựng từ file!`);
    } catch (err) {
      console.error('Failed to import vocabularies from file:', err);
      alert('Không thể thêm từ vựng từ file. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="text-green-600" size={32} />
            Quản lý Từ vựng
          </h1>
          <p className="text-gray-500 mt-1">Thêm và quản lý từ vựng cho bài học</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg"
          >
            <Plus size={20} />
            Thêm từ vựng mới
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg"
          >
            <Plus size={20} />
            Thêm nhiều từ vựng
          </button>
          <button
            onClick={() => setShowFileModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg"
          >
            <Upload size={20} />
            Upload file DOCX
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm từ vựng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterLesson}
            onChange={(e) => setFilterLesson(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Tất cả bài học</option>
            {lessons.map(lesson => (
              <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
            ))}
          </select>
          
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Tất cả cấp độ</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterLesson('');
              setFilterLevel('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Vocabulary List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Từ vựng
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nghĩa
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phiên âm
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Loại từ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Bài học
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cấp độ
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vocabularies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <BookOpen className="mx-auto mb-3 text-gray-300" size={48} />
                    <p className="text-lg">Chưa có từ vựng nào</p>
                    <p className="text-sm mt-1">Nhấn "Thêm từ vựng mới" để bắt đầu</p>
                  </td>
                </tr>
              ) : (
                vocabularies.map((vocab) => (
                  <tr key={vocab._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{vocab.word}</div>
                      {vocab.stress && <div className="text-xs text-gray-500 mt-1">{vocab.stress}</div>}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{vocab.meaning}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {vocab.phonetic && (
                          <span className="text-sm text-gray-600">{vocab.phonetic}</span>
                        )}
                        {(vocab.pronunciationUS || vocab.pronunciationUK) && (
                          <Volume2 className="text-green-600" size={16} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {vocab.partOfSpeech && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                          {vocab.partOfSpeech}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {vocab.lesson?.title || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        {vocab.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(vocab)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(vocab._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingVocab ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Word */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Từ vựng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.word}
                    onChange={(e) => setFormData(prev => ({ ...prev, word: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Hello"
                  />
                </div>

                {/* Meaning */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nghĩa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.meaning}
                    onChange={(e) => setFormData(prev => ({ ...prev, meaning: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Xin chào"
                  />
                </div>

                {/* Phonetic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phiên âm IPA
                  </label>
                  <input
                    type="text"
                    value={formData.phonetic}
                    onChange={(e) => setFormData(prev => ({ ...prev, phonetic: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="/həˈləʊ/"
                  />
                </div>

                {/* Stress */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trọng âm
                  </label>
                  <input
                    type="text"
                    value={formData.stress}
                    onChange={(e) => setFormData(prev => ({ ...prev, stress: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="HEL-lo (1st syllable)"
                  />
                </div>

                {/* Part of Speech */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại từ
                  </label>
                  <select
                    value={formData.partOfSpeech}
                    onChange={(e) => setFormData(prev => ({ ...prev, partOfSpeech: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="noun">Noun (Danh từ)</option>
                    <option value="verb">Verb (Động từ)</option>
                    <option value="adjective">Adjective (Tính từ)</option>
                    <option value="adverb">Adverb (Trạng từ)</option>
                    <option value="preposition">Preposition (Giới từ)</option>
                    <option value="conjunction">Conjunction (Liên từ)</option>
                    <option value="pronoun">Pronoun (Đại từ)</option>
                    <option value="interjection">Interjection (Thán từ)</option>
                  </select>
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>

                {/* Lesson */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bài học
                  </label>
                  <select
                    value={formData.lesson as any}
                    onChange={(e) => setFormData(prev => ({ ...prev, lesson: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn bài học --</option>
                    {lessons.map(lesson => (
                      <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
                    ))}
                  </select>
                </div>

                {/* Example */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ví dụ
                  </label>
                  <input
                    type="text"
                    value={formData.example}
                    onChange={(e) => setFormData(prev => ({ ...prev, example: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Hello, how are you?"
                  />
                </div>

                {/* Example Translation */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dịch ví dụ
                  </label>
                  <input
                    type="text"
                    value={formData.exampleTranslation}
                    onChange={(e) => setFormData(prev => ({ ...prev, exampleTranslation: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Xin chào, bạn khỏe không?"
                  />
                </div>

                {/* Synonyms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Từ đồng nghĩa (phân cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={formData.synonyms?.join(', ')}
                    onChange={(e) => handleArrayInput('synonyms', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="hi, hey, greetings"
                  />
                </div>

                {/* Antonyms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Từ trái nghĩa (phân cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={formData.antonyms?.join(', ')}
                    onChange={(e) => handleArrayInput('antonyms', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="goodbye, bye, farewell"
                  />
                </div>

                {/* Pronunciation US */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phát âm US (URL hoặc text)
                  </label>
                  <input
                    type="text"
                    value={formData.pronunciationUS}
                    onChange={(e) => setFormData(prev => ({ ...prev, pronunciationUS: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/audio.mp3"
                  />
                </div>

                {/* Pronunciation UK */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phát âm UK (URL hoặc text)
                  </label>
                  <input
                    type="text"
                    value={formData.pronunciationUK}
                    onChange={(e) => setFormData(prev => ({ ...prev, pronunciationUK: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/audio.mp3"
                  />
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL hình ảnh
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg"
                >
                  {editingVocab ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Thêm nhiều từ vựng
              </h2>
              <p className="text-gray-600 mt-1">Nhập danh sách từ vựng theo định dạng tab-separated</p>
            </div>
            
            <form onSubmit={handleBulkSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Lesson */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bài học
                  </label>
                  <select
                    value={bulkData.lesson}
                    onChange={(e) => setBulkData(prev => ({ ...prev, lesson: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn bài học --</option>
                    {lessons.map(lesson => (
                      <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
                    ))}
                  </select>
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ
                  </label>
                  <select
                    value={bulkData.level}
                    onChange={(e) => setBulkData(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>

                {/* Part of Speech */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại từ (áp dụng cho tất cả)
                  </label>
                  <select
                    value={bulkData.partOfSpeech}
                    onChange={(e) => setBulkData(prev => ({ ...prev, partOfSpeech: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="noun">Noun (Danh từ)</option>
                    <option value="verb">Verb (Động từ)</option>
                    <option value="adjective">Adjective (Tính từ)</option>
                    <option value="adverb">Adverb (Trạng từ)</option>
                    <option value="preposition">Preposition (Giới từ)</option>
                    <option value="conjunction">Conjunction (Liên từ)</option>
                    <option value="pronoun">Pronoun (Đại từ)</option>
                    <option value="interjection">Interjection (Thán từ)</option>
                  </select>
                </div>
              </div>

              {/* Bulk Text Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh sách từ vựng <span className="text-red-500">*</span>
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={16} />
                    Mẫu định dạng:
                  </h4>
                  <div className="bg-white border border-gray-300 rounded p-3 font-mono text-sm">
                    <div className="text-gray-600 mb-2">Mỗi dòng một từ vựng, phân cách bằng tab:</div>
                    <div className="space-y-1 text-gray-800">
                      <div>Hello<span className="text-blue-600">→</span>Xin chào<span className="text-blue-600">→</span>/həˈləʊ/<span className="text-blue-600">→</span>Hello, how are you?<span className="text-blue-600">→</span>Xin chào, bạn khỏe không?</div>
                      <div>Goodbye<span className="text-blue-600">→</span>Tạm biệt<span className="text-blue-600">→</span>/ɡʊdˈbaɪ/<span className="text-blue-600">→</span>Goodbye, see you later<span className="text-blue-600">→</span>Tạm biệt, hẹn gặp lại</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <strong>Thứ tự:</strong> Từ vựng → Nghĩa → Phiên âm → Ví dụ → Dịch ví dụ
                    </div>
                  </div>
                </div>
                <textarea
                  required
                  value={bulkData.text}
                  onChange={(e) => setBulkData(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={12}
                  placeholder={`Hello	Xin chào	/həˈləʊ/	Hello, how are you?	Xin chào, bạn khỏe không?
Goodbye	Tạm biệt	/ɡʊdˈbaɪ/	Goodbye, see you later	Tạm biệt, hẹn gặp lại
Thank you	Cảm ơn	/θæŋk juː/	Thank you very much	Cảm ơn bạn rất nhiều`}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
                >
                  Thêm từ vựng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Upload file DOCX
              </h2>
              <p className="text-gray-600 mt-1">Tải lên file Word chứa danh sách từ vựng</p>
            </div>
            
            <form onSubmit={handleFileSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Lesson */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bài học
                  </label>
                  <select
                    value={fileData.lesson}
                    onChange={(e) => setFileData(prev => ({ ...prev, lesson: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn bài học --</option>
                    {lessons.map(lesson => (
                      <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
                    ))}
                  </select>
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ
                  </label>
                  <select
                    value={fileData.level}
                    onChange={(e) => setFileData(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>

                {/* Part of Speech */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại từ (áp dụng cho tất cả)
                  </label>
                  <select
                    value={fileData.partOfSpeech}
                    onChange={(e) => setFileData(prev => ({ ...prev, partOfSpeech: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="noun">Noun (Danh từ)</option>
                    <option value="verb">Verb (Động từ)</option>
                    <option value="adjective">Adjective (Tính từ)</option>
                    <option value="adverb">Adverb (Trạng từ)</option>
                    <option value="preposition">Preposition (Giới từ)</option>
                    <option value="conjunction">Conjunction (Liên từ)</option>
                    <option value="pronoun">Pronoun (Đại từ)</option>
                    <option value="interjection">Interjection (Thán từ)</option>
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn file DOCX <span className="text-red-500">*</span>
                </label>
                
                {/* Format Example */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={16} />
                    Mẫu định dạng file DOCX:
                  </h4>
                  <div className="bg-white border border-gray-300 rounded p-3 font-mono text-sm">
                    <div className="text-gray-600 mb-2">Mỗi dòng một từ vựng, phân cách bằng tab:</div>
                    <div className="space-y-1 text-gray-800">
                      <div>Hello<span className="text-blue-600">→</span>Xin chào<span className="text-blue-600">→</span>/həˈləʊ/<span className="text-blue-600">→</span>Hello, how are you?<span className="text-blue-600">→</span>Xin chào, bạn khỏe không?</div>
                      <div>Goodbye<span className="text-blue-600">→</span>Tạm biệt<span className="text-blue-600">→</span>/ɡʊdˈbaɪ/<span className="text-blue-600">→</span>Goodbye, see you later<span className="text-blue-600">→</span>Tạm biệt, hẹn gặp lại</div>
                      <div>Thank you<span className="text-blue-600">→</span>Cảm ơn<span className="text-blue-600">→</span>/θæŋk juː/<span className="text-blue-600">→</span>Thank you very much<span className="text-blue-600">→</span>Cảm ơn bạn rất nhiều</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <strong>Thứ tự:</strong> Từ vựng → Nghĩa → Phiên âm → Ví dụ → Dịch ví dụ
                    </div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {uploadedFile ? uploadedFile.name : 'Nhấn để chọn file DOCX'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Chỉ hỗ trợ file .docx (file Word thực sự)
                    </p>
                  </label>
                </div>
              </div>

              {/* File Content Preview */}
              {fileContent && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung file (xem trước)
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{fileContent}</pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Hệ thống sẽ tự động phân tích nội dung và tạo từ vựng. Mỗi dòng sẽ được coi là một từ vựng.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowFileModal(false);
                    setUploadedFile(null);
                    setFileContent('');
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!fileContent}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors shadow-lg"
                >
                  Import từ vựng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



