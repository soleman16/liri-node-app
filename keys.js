console.log('Loading environment info...');

exports.spotify = {
  id: process.env.SPOTIFY_ID,
  secret: process.env.SPOTIFY_SECRET
};

exports.omdbApiKey = process.env.OMDB_API_KEY;

exports.bandsInTownAppId = process.env.BANDS_IN_TOWN_APP_ID;