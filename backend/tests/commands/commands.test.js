const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');

// Données de test
const testUser = {
  email: 'commands-test@example.com',
  password: 'Password123!',
  username: 'commandsuser'
};

let authToken;

// Configuration avant tous les tests
beforeAll(async () => {
  // Connecter à la base de données de test
  const mongoURI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/chat_test';
  await mongoose.connect(mongoURI);
  
  // Enregistrer un utilisateur de test et obtenir un token
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send(testUser);
  
  authToken = registerResponse.body.token;
});

// Nettoyage après tous les tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('External Commands API', () => {
  describe('POST /api/external/weather', () => {
    it('should return weather data for a valid city', async () => {
      const res = await request(app)
        .post('/api/external/weather')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: 'Paris' })
        .expect(200);

      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('weather');
      expect(res.body.weather).toHaveProperty('city');
      expect(res.body.weather).toHaveProperty('temp');
    });

    it('should handle invalid city names', async () => {
      const res = await request(app)
        .post('/api/external/weather')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: 'INVALIDCITYNAME12345' })
        .expect(404);

      expect(res.body).toHaveProperty('message');
    });

    it('should reject requests without authentication', async () => {
      await request(app)
        .post('/api/external/weather')
        .send({ query: 'Paris' })
        .expect(401);
    });
  });

  // Les tests Pokemon ont été supprimés pour simplifier l'application
  // Seuls les tests météo sont conservés car nous n'utilisons plus l'API Pokemon
});
