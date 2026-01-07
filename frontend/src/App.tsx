import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

export default function App() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  

  return (
    <>
      <header className="app-header">
        <div className="container">
          <h1>drushim</h1>
          <nav>
            <Link to="/">Home</Link>
            {'  |  '}
            {isAuthenticated ? (
              <>
                <Link to="/create">Create a job</Link>
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
