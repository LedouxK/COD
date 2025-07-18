// Mocks pour les APIs externes utilisées dans les tests
const weatherMock = {
  name: 'Paris',
  sys: {
    country: 'FR'
  },
  main: {
    temp: 21.5,
    humidity: 65
  },
  weather: [
    {
      description: 'nuageux',
      icon: '04d'
    }
  ],
  wind: {
    speed: 4.2
  }
};

const pokemonMock = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  types: [
    {
      type: {
        name: 'electric'
      }
    }
  ],
  abilities: [
    {
      ability: {
        name: 'static'
      }
    },
    {
      ability: {
        name: 'lightning-rod'
      }
    }
  ],
  sprites: {
    front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
  }
};

module.exports = {
  weatherMock,
  pokemonMock
};
