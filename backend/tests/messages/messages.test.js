const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../app');

// Données de test
const testUser = {
  email: 'message-test@example.com',
  password: 'Password123!',
  username: 'messageuser'
};

let authToken;
let userId;

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
  
  // Enregistrer un utilisateur de test et obtenir un token
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send(testUser);
  
  authToken = registerResponse.body.token;
  userId = registerResponse.body.userId;

  // Créer quelques messages de test
  await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ content: 'Message de test 1' });

  await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ content: 'Message de test 2' });
});

// Nettoyage après tous les tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Messages API', () => {
  describe('GET /api/messages', () => {
    it('should get all messages with authentication', async () => {
      const res = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      res.body.forEach(message => {
        expect(message).toHaveProperty('_id');
        expect(message).toHaveProperty('content');
        expect(message).toHaveProperty('user');
        expect(message).toHaveProperty('createdAt');
      });
    });

    it('should not allow access without authentication', async () => {
      await request(app)
        .get('/api/messages')
        .expect(401);
    });

    it('should support pagination with limit and skip', async () => {
      const res = await request(app)
        .get('/api/messages?limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
    });
  });

  describe('POST /api/messages', () => {
    it('should create a new message', async () => {
      const newMessage = { content: 'Nouveau message de test' };
      
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newMessage)
        .expect(201);

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('content', newMessage.content);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('_id', userId);
    });

    it('should reject empty messages', async () => {
      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: '' })
        .expect(400);
    });

    it('should reject requests without authentication', async () => {
      await request(app)
        .post('/api/messages')
        .send({ content: 'Test sans authentification' })
        .expect(401);
    });
  });
});
