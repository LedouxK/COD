import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation basique des champs
    if (!email || !username || !password || !confirmPassword) {
      setFormError('Veuillez remplir tous les champs.');
      return;
    }

    // Vérification que les mots de passe correspondent
    if (password !== confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas.');
      return;
    }

    // Vérification de la complexité du mot de passe
    if (password.length < 6) {
      setFormError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      await register(email, password, username);
      navigate('/chat'); // Rediriger vers le chat après inscription
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      // Le message d'erreur est déjà géré par le contexte Auth
    }
  };

  return (
    <div className="register-container">
      <div className="auth-form-container">
        <h2>Inscription</h2>
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
              data-cy="register-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre email"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              data-cy="register-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez un nom d'utilisateur"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              data-cy="register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              data-cy="register-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez votre mot de passe"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="auth-button" data-cy="register-submit" disabled={loading}>
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>
        <div className="auth-link">
          <p>Vous avez déjà un compte ? <Link to="/login">Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
