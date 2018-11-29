require("dotenv").config();
let keys = require("./keys");
let axios = require("axios");
let dedent = require("dedent-js");
let moment = require("moment");
let Spotify = require("node-spotify-api");
let fs = require("fs");
let inquirer = require("inquirer");

// list of questions for the prompt
let questions = [
    {
        type: "list",
        name: "userSelection",
        message: "What command would you like to run?",
        choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says"]
    },
    {
        type: "input",
        name: "userSearch",
        message: "What do you want to search for?",
    },
  
]

/**
 * If a userSelection (command) is provided when the program is run, this method
 * will call the appropriate function.
 * 
 * If no userSelection is provided, the program will prompt the user for more
 * information before calling the appropriate function
 * 
 * @param {*} userSelection 
 * @param {*} userSearch 
 */
function determineUserSelection(userSelection, userSearch){

    // If no userSelection is provided the program will prompt the user for more information.
    // Once the appropriate information is provided, this function will be called recursively
    if(!userSelection){
        inquirer.prompt(questions).then(answers => {
            determineUserSelection(answers.userSelection, answers.userSearch);
        });
    }
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
            doWhatItSays(userSelection);
            break;
    }
}

/**
 *  Searches the BandsInTown API and display information about the
 *  concert venue(s) that match the search criteria
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
 *  Searches Spotify by the song title and displays information about the
 *  song(s) that match the search criteria
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
 *  Searches OMDB by the supplied movie title and displays information
 *  about the movie(s) that match the search criteria.
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
            Language: ${language}
            Plot: ${plot}
            Actors: ${actors}`);

        console.log(displayText + '\n');
        logToFile(displayText);
    }
};

/**
 *  Reads commands from the random.txt and then executes them
 */
let doWhatItSays = function (){
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
 * Writes log to the logs.txt file
 */
function logToFile(text){
    fs.appendFile('log.txt', text + '\n\n', function (err) {
        if (err){
            throw err;
        } 
      });
}

determineUserSelection(process.argv[2], process.argv[3]);