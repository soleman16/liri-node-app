# liri-node-app

### Commands

1. concert-this - This will return back a list of events that match the search criteria and will include relevant information for that event.
    * `node liri.js concert-this '<artist/band name here>'`
2. spotify-this-song - This will return back a list of songs that match the search criteria and will include relevant information about that song.
    * `node liri.js spotify-this-song '<song name here>'`
3. movie-this - This will return back a list of movies that match the search criteria and will include relevant information about that movie.
    * `node liri.js movie-this '<movie name here>'`
4. do-what-it-says - This will run whatever command is in the random.txt file

### Prerequisites

In order to run this application a `.env` file needs to be created and the following properties need to be added:

  ```
  SPOTIFY_ID=<ID>
  SPOTIFY_SECRET=<Secret>

  OMDB_API_KEY=<key>

  BANDS_IN_TOWN_APP_ID=<app id>
  ```