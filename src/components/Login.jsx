import { useState } from 'react';
import axios from 'axios';
import "../styles/components/LoginForm.scss"
import { useNavigate } from 'react-router-dom';


const LoginForm = ({setIsAuthenticated}) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = ({ target: { name, value } }) => {
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await axios.post('https://reimagined-journey-5r599v49g9r2577-5000.app.github.dev/login', credentials);
      // Store the token (in production, secure this appropriately)
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };


  return (
    <div className="login-container">
      <div className='login-left'>
      <h1>Quality Control Dashboard</h1>
    <form onSubmit={handleSubmit} className='login-form'>
    <div className='login-title'><h2>Login</h2></div>
    <div className='login-title'>
    {error && <p className="login-error">! {error} !</p>}

    </div>

      <div className='username-input login-input'>
        <label htmlFor="username">Username:</label>
        <input
          id="username"
          name="username"
          type="text"
          value={credentials.username}
          onChange={handleChange}
          required
        />
      </div>
      <div className='password-input login-input'>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          required
        />
      </div>
     <div className='login-btn-container'>
     <button type="submit">Login</button>

     </div>
    </form>
      </div>
      <div className='login-right'>
        <img className='deco-image' src='https://www.tamaracomolli.com/cdn/shop/files/TC_SLIDER_4000_2000_NOVELTIES9_3072x3072.jpg?v=1646316981'></img>
      </div>


  </div>
  );
};

export default LoginForm;
