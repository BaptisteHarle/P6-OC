const config = {
  endpoint: '/api',
  db: {
    host: 'cluster0.0at5y.mongodb.net',
    name: 'soPecko',
    username: 'BaptisteHarle',
    password: 'YkE5uh18qWA9ob1Y',
  },
  encrypt: {
    workDifficulty: 10,
  },
  jwt: {
    secret: '5396dc81fd4ff02901324afe054dae1382f7c71d01d2c38c83660c390d03703314bc2d171fc828bbc9519f6c86728d22da8b073ab3980aad3da97736bc8b783e',
  },
  files: {
    validExtensions: ['image/jpg', 'image/jpeg', 'image/png'],
  },
};

module.exports = config;
