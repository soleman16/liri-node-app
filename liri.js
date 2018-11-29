require("dotenv").config();
let keys = require("./keys");
let axios = require("axios");
let dedent = require("dedent-js");
let moment = require("moment");
let Spotify = require("node-spotify-api");
let fs = require("fs");

function determineUserSelection(userSelection, userSearch){
    switch(userSelection) {
        case "concert-this":
        if(!userSearch){
            userSearch = "Ghost";
        }
            concerts.getConcerts(userSearch);
            break;
        case "spotify-this-song":
            if(!userSearch){
                userSearch = "The Sign";
            }
            songs.getSongs(userSearch);
            break;
        case "movie-this":
            if(!userSearch){
                userSearch = "Mr. Nobody";
            }
            movies.getMovies(userSearch);
            break;
        case "do-what-it-says":
            readFromFile(userSelection);
            break;
    }
}

/**
 *  - This will search the Bands in Town Artist Events API ("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp") 
 *    for an artist and render the following information about each event to the terminal:
 *      - Name of the venue
 *      - Venue location
 *      - Date of the Event (use moment to format this as "MM/DD/YYYY")
 */
let concerts = {
    apiKey: keys.bandsInTownAppId,
    getConcerts: function(userSearch){
        axios({
            method:'get',
            url: `https://rest.bandsintown.com/artists/${userSearch}/events?app_id=${concerts.apiKey}`,
            responseType:'json'
            })
            .then(function(response) {
            concerts.displayResults(response.data);
        });
    },
    displayResults: function(response){
        for(let index in response){
            let currentEventData = response[index];
            let venueName = currentEventData.venue.name;
            let venueLocation = `${currentEventData.venue.city}, ${currentEventData.venue.region} ${currentEventData.venue.country}`;
            let eventDate = currentEventData.datetime;
            let formattedEventData = moment(eventDate).format('MM/DD/YYYY');
            
            let displayText = dedent(`
                Venue Name: ${venueName}
                Venue Location: ${venueLocation}
                Event Date: ${formattedEventData}`);

            console.log(displayText + '\n');
            logToFile(displayText);
        }
    }
};

/**
 *   - This will show the following information about the song in your terminal/bash window
 *      - Artist(s)
 *      - The song's name
 *      - A preview link of the song from Spotify
 *      - The album that the song is from
 *   
 *   - If no song is provided then your program will default to "The Sign" by Ace of Base.
 *   - You will utilize the node-spotify-api package in order to retrieve song information from the Spotify API.
 */
let songs = {
    getArtists: function(artist){
        return artist.name;
    },
    getSongs: function(userSearch){
        var spotify = new Spotify({
          id: keys.spotify.id,
          secret: keys.spotify.secret
        });
         
        spotify
          .search({ type: 'track', query: userSearch, limit: 2 })
          .then(function(response) {
            songs.displayResults(response);
          })
          .catch(function(err) {
            console.log(err);
          });
    },
    displayResults: function(response){
        let songs = response.tracks.items;
        for(let index in songs){
            let currentSong = songs[index];
            let artistName = currentSong.artists.map(this.getArtists);
            let songName = currentSong.name;
            let previewUrl = currentSong.preview_url;
            let albumName = currentSong.album.name;

            let displayText = dedent(`
                Artists(s): ${artistName}
                Song name: ${songName}
                Preview link: ${previewUrl}
                Album name: ${albumName}`);
            console.log(displayText + '\n');
            logToFile(displayText);
        }
    }
}

/**
 *  - This will output the following information to your terminal/bash window:
 *      - Title of the movie.
 *      - Year the movie came out.
 *      - IMDB Rating of the movie.
 *      - Rotten Tomatoes Rating of the movie.
 *      - Country where the movie was produced.
 *      - Language of the movie.
 *      - Plot of the movie.
 *      - Actors in the movie.
 * 
 *  - If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'
 *  - You'll use the axios package to retrieve data from the OMDB API. Like all of the in-class activities, 
 *    the OMDB API requires an API key. You may use trilogy.
 */
let movies = {
    apiKey: keys.omdbApiKey,
    getRatings(ratings, source){
        for(index in ratings)
        {
            let currentRating = ratings[index];
            if(currentRating.Source === source){
                return currentRating.Value;
            }
        }
    },
    getMovies: function(userSearch){
        axios({
            method:'get',
            url: `http://www.omdbapi.com/?apikey=${movies.apiKey}&t=${userSearch}`,
            responseType:'json'
            })
            .then(function(response) {
            movies.displayResults(response.data);
        });
    },
    displayResults: function(movie){
        let title = movie.Title;
        let year = movie.Year;
        let imdbRating = movies.getRatings(movie.Ratings, "Internet Movie Database")
        let rottenTomatoesRating = movies.getRatings(movie.Ratings, "Rotten Tomatoes")
        let country = movie.Country;
        let language = movie.Language;
        let plot = movie.Plot;
        let actors = movie.Actors;

        let displayText = dedent(`
            Title: ${title}
            Year: ${year}
            IMDB Rating: ${imdbRating}
            Rotten Tomatoes Rating: ${rottenTomatoesRating}
            Country: ${country}
            language: ${language}
            plot: ${plot}
            actors: ${actors}`);

        console.log(displayText + '\n');
        logToFile(displayText);
    }
};

/**
 *  - Using the fs Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
 *      - It should run spotify-this-song for "I Want it That Way," as follows the text in random.txt
 *      - Edit the text in random.txt to test out the feature for movie-this and concert-this.
 */
let readFromFile = function doWhatItSays(userSelection){
    fs.readFile('./random.txt', "utf8", function read(err, data) {
        if (err) {
            throw err;
        }
        let commands = data.split(",");
        let userSelection = commands.splice(0,1).join("");
        let userSearch = commands.join(",");
        determineUserSelection(userSelection, userSearch);
    });
}

/**
 * BONUS:
 * 
 *  - In addition to logging the data to your terminal/bash window, output the data to a .txt file called log.txt.
 *      - Make sure you append each command you run to the log.txt file. 
 *      - Do not overwrite your file each time you run a command.
 */
function logToFile(text){
    fs.appendFile('log.txt', text + '\n\n', function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
}

determineUserSelection(process.argv[2], process.argv[3]);