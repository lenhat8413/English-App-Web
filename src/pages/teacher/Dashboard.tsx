import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Brain, Video, TrendingUp, Clock } from 'lucide-react';
import api from '../../api/http';

interface TeacherStats {
  myStudents: number;
  totalLessons: number;
  totalQuizzes: number;
  totalVideos: number;
  recentProgress: any[];
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<TeacherStats>({
    myStudents: 0,
    totalLessons: 0,
    totalQuizzes: 0,
    totalVideos: 0,
    recentProgress: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch teacher-specific data
      const [studentsRes, lessonsRes, quizzesRes, videosRes, progressRes] = await Promise.all([
        api.get('/api/reports/teacher/students').catch(() => ({ data: { count: 0 } })),
        api.get('/api/lessons').catch(() => ({ data: [] })),
        api.get('/api/quizzes').catch(() => ({ data: [] })),
        api.get('/api/videos').catch(() => ({ data: [] })),
        api.get('/api/reports/teacher/progress').catch(() => ({ data: { recent: [] } }))
      ]);

      setStats({
        myStudents: studentsRes.data.count || 0,
        totalLessons: lessonsRes.data.length || 0,
        totalQuizzes: quizzesRes.data.length || 0,
        totalVideos: videosRes.data.length || 0,
        recentProgress: progressRes.data.recent || []
      });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Không thể tải dữ liệu dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Học viên của tôi',
      value: stats.myStudents,
      icon: Users,
      color: 'green',
      link: '/teacher/students'
    },
    {
      title: 'Bài học',
      value: stats.totalLessons,
      icon: BookOpen,
      color: 'purple',
      link: '/teacher/lessons'
    },
    {
      title: 'Quiz',
      value: stats.totalQuizzes,
      icon: Brain,
      color: 'rose',
      link: '/teacher/quizzes'
    },
    {
      title: 'Video',
      value: stats.totalVideos,
      icon: Video,
      color: 'amber',
      link: '/teacher/videos'
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Teacher Dashboard
            </h1>
            <p className="text-gray-500">
              Quản lý học viên và nội dung giảng dạy
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-xl shadow-sm border-t-4 border-green-500 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-${card.color}-100 rounded-lg`}>
                  <Icon className={`text-${card.color}-600`} size={24} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
              <p className={`text-3xl font-bold text-${card.color}-600`}>{card.value}</p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span>Xem chi tiết</span>
                <TrendingUp size={16} className="ml-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="text-green-600" size={24} />
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Link
            to="/teacher/students"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Users className="text-green-600" size={24} />
            <span className="font-medium text-gray-700">Xem học viên</span>
          </Link>
          <Link
            to="/teacher/lessons"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <BookOpen className="text-purple-600" size={24} />
            <span className="font-medium text-gray-700">Quản lý bài học</span>
          </Link>
          <Link
            to="/teacher/quiz/import"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Brain className="text-rose-600" size={24} />
            <span className="font-medium text-gray-700">Import quiz</span>
          </Link>
          <Link
            to="/teacher/vocab/import"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Video className="text-amber-600" size={24} />
            <span className="font-medium text-gray-700">Import vocab</span>
          </Link>
        </div>
      </div>

      {/* Recent Student Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="text-green-600" size={24} />
          Tiến độ học viên gần đây
        </h2>
        {stats.recentProgress.length > 0 ? (
          <div className="space-y-4">
            {stats.recentProgress.map((progress, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {progress.studentName || 'Học viên'} - {progress.activity || 'Hoàn thành bài học'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {progress.timestamp || 'Vừa xong'}
                  </p>
                </div>
                <div className="text-sm font-bold text-green-600">
                  +{progress.points || 0} điểm
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📈</div>
            <p className="text-gray-500">Chưa có tiến độ học tập nào</p>
          </div>
        )}
      </div>
    </div>
  );
}












