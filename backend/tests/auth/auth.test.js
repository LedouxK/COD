const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../app'); // Assurez-vous que votre server.js exporte l'app

// Mock de la base de données pour les tests
const mockUser = {
  email: 'test@example.com',
  password: 'Password123!',
  username: 'testuser'
};

// Configuration avant tous les tests
beforeAll(async () => {
  // Vérifier si une connexion MongoDB existe déjà
  if (mongoose.connection.readyState === 0) {
    // Aucune connexion active, on se connecte à la base de test
    const mongoURI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/chat_test';
    await mongoose.connect(mongoURI);
  } else if (mongoose.connection.readyState === 1) {
    // Une connexion existe déjà, on réinitialise la base de données
    await mongoose.connection.dropDatabase();
  }
  
  // Nettoyer la base de données avant de commencer
  await mongoose.connection.dropDatabase();
});

// Nettoyage après tous les tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(mockUser)
        .expect(201);

      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('token');
    });

    it('should not register user with duplicate email', async () => {
      // Premier enregistrement a déjà été fait dans le test précédent
      const res = await request(app)
        .post('/api/auth/register')
        .send(mockUser)
        .expect(400);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/email.*utilisé/i); // Adapté pour accepter le nouveau message d'erreur plus précis
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid@example.com' }) // Manque password et username
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password
        })
        .expect(200);

      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('token');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(res.body).toHaveProperty('message');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: mockUser.password
        })
        .expect(401);

      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/auth/validate-token', () => {
    let token;

    beforeAll(async () => {
      // Obtenir un token valide
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password
        });
      
      token = res.body.token;
    });

    it('should validate a valid token', async () => {
      const res = await request(app)
        .get('/api/auth/validate-token')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('valid', true);
      expect(res.body).toHaveProperty('user');
    });

    it('should not validate an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/validate-token')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(res.body).toHaveProperty('valid', false);
    });
  });
});
