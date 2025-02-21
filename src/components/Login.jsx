import { useState } from 'react';
import axios from 'axios';
import "../styles/components/LoginForm.scss"
import { useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import Loading from "./Loading";


const LoginForm = ({setIsAuthenticated}) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  const handleChange = ({ target: { name, value } }) => {
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(credentials); // Call API function
      localStorage.setItem("token", data.token);
      setIsAuthenticated(true);
      setLoading(false)
      navigate("/app/dashboard");
    } catch (errorMessage) {
      setError(errorMessage);
      setLoading(false)
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
   {loading?   <Loading/>:
     <button type="submit">Login</button>}

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
