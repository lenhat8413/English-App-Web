import { useState, useEffect } from 'react';
import api from '../api/http';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  lessonId: string;
  timeLimit?: number;
  maxAttempts: number;
  isActive: boolean;
  lesson?: {
    id: string;
    title: string;
  };
  questions?: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  type: string;
  options?: string;
  correctAnswer: string;
  explanation?: string;
  points: number;
  order: number;
}

interface Lesson {
  id: string;
  title: string;
  level: string;
}

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [timeLimit, setTimeLimit] = useState<number | ''>('');
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [questions, setQuestions] = useState<Partial<QuizQuestion>[]>([]);

  useEffect(() => {
    fetchQuizzes();
    fetchLessons();
  }, []);

  const fetchQuizzes = async () => {
    try {
      // Note: We need to create a GET /quiz endpoint to list all quizzes
      // For now, we'll need to fetch via lessons
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch quizzes');
    }
  };

  const fetchLessons = async () => {
    try {
      // Note: We need a GET /lessons endpoint
      // For demo purposes, we'll use mock data
      setLessons([]);
    } catch (err: any) {
      setError('Failed to fetch lessons');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const quizData = {
        title,
        description,
        lessonId,
        timeLimit: timeLimit || null,
        maxAttempts,
        questions: questions.map((q, idx) => ({
          ...q,
          order: q.order !== undefined ? q.order : idx,
          options: q.options ? JSON.parse(q.options as string) : null
        }))
      };

      if (selectedQuiz) {
        await api.put(`/quiz/${selectedQuiz.id}`, quizData);
      } else {
        await api.post('/quiz', quizData);
      }

      resetForm();
      fetchQuizzes();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setTitle(quiz.title);
    setDescription(quiz.description || '');
    setLessonId(quiz.lessonId);
    setTimeLimit(quiz.timeLimit || '');
    setMaxAttempts(quiz.maxAttempts);
    setQuestions(quiz.questions || []);
    setShowForm(true);
  };

  const handleDelete = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await api.delete(`/quiz/${quizId}`);
      fetchQuizzes();
    } catch (err: any) {
      setError('Failed to delete quiz');
    }
  };

  const resetForm = () => {
    setSelectedQuiz(null);
    setTitle('');
    setDescription('');
    setLessonId('');
    setTimeLimit('');
    setMaxAttempts(3);
    setQuestions([]);
    setShowForm(false);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        type: 'MULTIPLE_CHOICE',
        options: '[]',
        correctAnswer: '',
        explanation: '',
        points: 1,
        order: questions.length
      }
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', fontFamily: 'system-ui', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1>Quiz Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer'
          }}
        >
          + Create Quiz
        </button>
      </div>

      {error && (
        <div style={{ padding: 15, backgroundColor: '#f8d7da', color: '#721c24', borderRadius: 5, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {showForm ? (
        <div style={{ backgroundColor: '#f8f9fa', padding: 30, borderRadius: 10, marginBottom: 30 }}>
          <h2>{selectedQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: '100%', padding: 10, borderRadius: 5, border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: 10, borderRadius: 5, border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Lesson ID *</label>
              <input
                type="text"
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                required
                placeholder="Enter lesson ID"
                style={{ width: '100%', padding: 10, borderRadius: 5, border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Time Limit (seconds)</label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="No limit"
                  style={{ width: '100%', padding: 10, borderRadius: 5, border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Max Attempts *</label>
                <input
                  type="number"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                  required
                  min={1}
                  style={{ width: '100%', padding: 10, borderRadius: 5, border: '1px solid #ddd' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <h3>Questions</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: 5,
                    cursor: 'pointer'
                  }}
                >
                  + Add Question
                </button>
              </div>

              {questions.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'white',
                    padding: 20,
                    borderRadius: 8,
                    marginBottom: 15,
                    border: '1px solid #ddd'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h4>Question {idx + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: 5,
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', marginBottom: 5 }}>Question Text *</label>
                    <input
                      type="text"
                      value={q.question || ''}
                      onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                      required
                      style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #ddd' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 5 }}>Type</label>
                      <select
                        value={q.type || 'MULTIPLE_CHOICE'}
                        onChange={(e) => updateQuestion(idx, 'type', e.target.value)}
                        style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #ddd' }}
                      >
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        <option value="TRUE_FALSE">True/False</option>
                        <option value="FILL_BLANK">Fill in the Blank</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 5 }}>Points *</label>
                      <input
                        type="number"
                        value={q.points || 1}
                        onChange={(e) => updateQuestion(idx, 'points', parseInt(e.target.value))}
                        min={1}
                        required
                        style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #ddd' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 5 }}>Order</label>
                      <input
                        type="number"
                        value={q.order !== undefined ? q.order : idx}
                        onChange={(e) => updateQuestion(idx, 'order', parseInt(e.target.value))}
                        min={0}
                        style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #ddd' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', marginBottom: 5 }}>
                      Options (JSON array, e.g., ["Option 1", "Option 2"])
                    </label>
                    <input
                      type="text"
                      value={q.options || '[]'}
                      onChange={(e) => updateQuestion(idx, 'options', e.target.value)}
                      placeholder='["Option 1", "Option 2", "Option 3", "Option 4"]'
                      style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #ddd' }}
                    />
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', marginBottom: 5 }}>Correct Answer *</label>
                    <input
                      type="text"
                      value={q.correctAnswer || ''}
                      onChange={(e) => updateQuestion(idx, 'correctAnswer', e.target.value)}
                      required
                      style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #ddd' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 5 }}>Explanation</label>
                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)}
                      style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #ddd' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 30px',
                  backgroundColor: loading ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 5,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Saving...' : selectedQuiz ? 'Update Quiz' : 'Create Quiz'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '10px 30px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 5,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <p style={{ color: '#666', marginBottom: 20 }}>
            Note: Quiz list will be displayed here. For now, please use the form above to create quizzes.
          </p>
        </div>
      )}
    </div>
  );
}






