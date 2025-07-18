import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      await login(email, password);
      navigate('/chat'); // Rediriger vers le chat après connexion
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
      // Le message d'erreur est déjà géré par le contexte Auth
    }
  };

  return (
    <div className="login-container">
      <div className="auth-form-container">
        <h2>Connexion</h2>
        <form onSubmit={handleSubmit}>
          {(error || formError) && (
            <div className="error-message">
              {formError || error}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              data-cy="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre email"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              data-cy="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="auth-button" data-cy="login-submit" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        <div className="auth-link">
          <p>Vous n'avez pas de compte ? <Link to="/register">S'inscrire</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
