// Configuration globale pour les tests Jest
require('dotenv').config({ path: '.env.test' });

// Augmenter le timeout pour les opérations asynchrones
jest.setTimeout(30000);

// Temporairement activer les logs pour débogage
// console.log = jest.fn();
// console.info = jest.fn();
// console.warn = jest.fn();
// console.error = jest.fn();
