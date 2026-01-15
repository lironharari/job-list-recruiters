import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

export default function App() {
  const { isAuthenticated, logout, role } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  

  return (
    <>
      <header className="app-header">
        <div className="container">
          <h1><Link to="/" className="logo-link">drushim</Link></h1>
          <nav>            
            {isAuthenticated ? (
              <>
                <Link to="/jobs">Jobs</Link>
                {'  |  '}
                <Link to="/create">Create a job</Link>
                {role === 'recruiter' || role === 'admin' ? (
                  <>
                    {'  |  '}
                    <Link to="/applications">Applications</Link>
                    {'  |  '}
                    <Link to="/templates">Email Templates</Link>
                  </>
                ) : null}
                {'  |  '}
                <button onClick={handleLogout} className="btn-link">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                {'  |  '}
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}
