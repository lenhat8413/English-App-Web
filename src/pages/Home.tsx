import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <header style={{ 
        background: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(10px)',
        padding: '1rem 0',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: '#333', fontSize: '1.8rem', fontWeight: 'bold' }}>
            📚 English Learning App
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link 
              to="/login" 
              style={{ 
                padding: '0.5rem 1.5rem', 
                background: 'transparent', 
                border: '2px solid #667eea', 
                borderRadius: '25px', 
                color: '#667eea', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              Đăng nhập
            </Link>
            <Link 
              to="/register" 
              style={{ 
                padding: '0.5rem 1.5rem', 
                background: '#667eea', 
                border: 'none', 
                borderRadius: '25px', 
                color: 'white', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ padding: '4rem 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '1.5rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            Học Tiếng Anh Thông Minh
          </h2>
          <p style={{ 
            fontSize: '1.3rem', 
            color: 'rgba(255,255,255,0.9)', 
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem auto'
          }}>
            Nền tảng quản lý học tiếng Anh dành cho Admin và Giảng viên. Học viên sử dụng ứng dụng mobile.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/register" 
              style={{ 
                padding: '1rem 2rem', 
                background: '#ff6b6b', 
                border: 'none', 
                borderRadius: '30px', 
                color: 'white', 
                textDecoration: 'none', 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(255,107,107,0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              Bắt đầu học ngay
            </Link>
            <Link 
              to="/login" 
              style={{ 
                padding: '1rem 2rem', 
                background: 'rgba(255,255,255,0.2)', 
                border: '2px solid white', 
                borderRadius: '30px', 
                color: 'white', 
                textDecoration: 'none', 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              Đã có tài khoản?
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section style={{ 
        background: 'rgba(255,255,255,0.95)', 
        padding: '4rem 0',
        marginTop: '4rem'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
          <h3 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            marginBottom: '3rem', 
            color: '#333' 
          }}>
            Tính năng nổi bật
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              background: 'white',
              borderRadius: '15px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍💼</div>
              <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>Quản lý Admin</h4>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Quản lý toàn bộ hệ thống, giảng viên và học viên với quyền truy cập cao nhất.
              </p>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              background: 'white',
              borderRadius: '15px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🏫</div>
              <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>Quản lý Giảng viên</h4>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Tạo bài học, quiz và video. Theo dõi tiến trình học tập của học viên.
              </p>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              background: 'white',
              borderRadius: '15px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
              <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>Học viên Mobile</h4>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Học viên sử dụng ứng dụng mobile để học tập, làm quiz và xem video.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: '#333', 
        color: 'white', 
        textAlign: 'center', 
        padding: '2rem 0',
        marginTop: '4rem'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
          <p style={{ margin: 0, opacity: 0.8 }}>
            © 2024 English Learning App. Học tiếng Anh hiệu quả, thông minh.
          </p>
        </div>
      </footer>
    </div>
  );
}
