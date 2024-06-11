const yt_api_key = "AIzaSyDE1-U79ej6aoXFkqJWRMw87WZX4JAr8gQ";
const yt_api_path = (query) => `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${yt_api_key}`;


function initial_setup() {
    $(".ans").hide();

    scrollToSection($("#front-sign-in"));

    $(".my-list").hide();
    $(".language-filter").hide();
}

function init() {
    fetchAndBuildAllSections(tmdb_example, genre_data);
    setupNavigationFiltering();
    // setupButton();
}

$(document).ready(() => {
    initial_setup();
    init();

    $(window).scroll(() => {
        if (window.scrollY > 5) {
            $("#header").addClass("black-bg");
        } 
        else {
            $("#header").removeClass("black-bg");
        }
    });
}); 




// Front Page
function signUpBtn() {
    scrollToSection($("#sign-up"));
}

function getStarted() {
    var emailValue = $("#email").val().trim();

    if (emailValue!== "") {
        $("#front-sign-in").hide();
        $("#get-started").show();
    } 
    else {
        $("#email").focus();
    }
}

function toggleDiv(divCl) {
    $("." + divCl).toggle(250);

    // $(this).find(".plus").toggle();
    // $(this).find(".mul").toggle();
}



//Sign-in Page
function validateSignUp() {
    var isValid = true;

    var enumVal = $("#email-number").val();
    var isValidEmail = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(enumVal);
    // var isValidPhone = /^\d{10}$/.test(enumVal);
    if (!isValidEmail) {
        $(".email-error").show();
        isValid = false;
    }

    var password = $('#password').val();
    if (password.length < 4 || password.length > 60) {
        $(".pass-error").show();
        isValid = false;
    }

    if(isValid) {
        var user = user_data.users[0];
        if ((enumVal === user.email || enumVal === user.username) && password === user.password) {
            scrollToSection($("#after-sign-in"));
        } 
        else {
            $(".invalid.credential").show();
            isValid = false;
        }
    }

    return isValid;
} 



// After sign in - Main Netflix
function buildBanner(movieItem) {
    $("#banner-section").css("background-image", `url(${movieItem.banner})`);

    const bannerSectionHTML = `
    <div class="banner-content container">
        <h2 class="banner-title">${movieItem.title}</h2>
        <p class="banner-info">#4 in TV Shows Today</p>
        <p class="banner-overview">${movieItem.overview}</p>
        <div class="action-buttons">
            <button class="action"><img src="./images/icons/play.png">Play</button>
            <button class="action"><img src="./images/icons/info.png">More Info</button>
        </div>
    </div>
    `;

    $("#banner-section").append(bannerSectionHTML);
}


// Returns result array with popularity higher than the threshold
function getMoviesByPopularity(data, threshold) {
    return data.results.filter(movie => movie.popularity > threshold);
}

function fetchAndBuildTrending(data) {
    const trendingData = getMoviesByPopularity(data, 80);
    buildMovieSection(trendingData, "Trending Now");

    const randomIndex = Math.floor(Math.random() * trendingData.length);
    buildBanner(trendingData[randomIndex]);
}


// Fetches each genre and builds sections for it
function fetchAndBuildAllSections(data, genreData) {
    const genres = genreData["genre"];
  
    if (Array.isArray(genres) && genres.length) {
        fetchAndBuildTrending(data);
        genres.forEach(genre => {
            fetchMovie(data, genre);
        });
        Hover();
    }
}  

// Returns results array that have genre id
function getMoviesByGenreId(data, genreId) {
    return data.results.filter(movie => movie.genre_ids.includes(genreId));
}

// Fetches each movie with different genre ids
function fetchMovie(data, genreItem) {
    const genre_id = genreItem["id"];
    const genre_name = genreItem["name"];

    const movies = getMoviesByGenreId(data, genre_id);
    if (Array.isArray(movies) && movies.length) {
        buildMovieSection(movies, genre_name);
    }
}

//Builds movie section
function buildMovieSection(dataList, category_name) {
    console.log(dataList, category_name);

    const movieListHTML = dataList.map(item => {
        const genres = item.genre_ids.map(id => genre_data.genre.find(genre => genre.id === id)?.name);
        const filteredGenres = genres.filter(genreName => genreName);
        const genreList = filteredGenres.join(', ');

        return `
        <div class="movie-item" onmouseover="searchMovieTrailer('${item.title}', 'yt${item.id}') id="${item.id}">
            <img class="movie-item-img" src="${item.backdrop_path}" alt="${item.title}">
            <div class="yt-iframe" id="yt${item.id}"></div>
            
            <div class="access">
                <ul class="first">
                    <li class="access-item" cat="play-video"><button><img src="./images/icons/play-circle.png"></button></li>
                    <li class="access-item" cat="add-to-list"><button><img src="./images/icons/add.png"></button></li>
                    <li class="access-item" cat="like"><button><img src="./images/icons/thumbs-up.png"></button></li>
                    <li class="access-item" cat="dislike"><button><img src="./images/icons/thumbs-down.png"></button></li>
                    <li class="access-item last" cat="big-screen"><button><img src="./images/icons/down-button.png"></button></li>
                </ul>
                <ul class="second">
                    <li class="access-item"><p class="green">93% Match</p></li>
                    <li class="access-item"><p class="sm-box">13+</p></li>
                <li class="access-item"><p>1 Season</p></li>
                <li class="access-item"><span class="sm-box hd">HD</span></li>
                </ul>
                <ul class="third">
                    <li class="access-item">${genreList}</li>
                </ul>
            </div>
        </div>
        `;
    }).join('');

    const movieSectionHTML = `
    <div class="movie-section">
        <h2 class="movie-section-heading">${category_name} <span class="explore-nudge">Explore All</span></h2>
        <div class="movie-row">
            ${movieListHTML}
        </div>
    </div>
    `;

    $("#movie-section").append(movieSectionHTML);
}


function searchMovieTrailer(movieName, iframeId) {
    if (!movieName) return;

    fetch(yt_api_path(movieName))
    .then(res => res.json())
    .then(res => {
        const bestResult = res.items[0];
        const movieTrailerHTML = `
        <div>
            <iframe width="245px" height="137px" src="https://www.youtube.com/embed/${bestResult.id.videoId}?autoplay=1&controls=0"></iframe>
        </div>`;

        $(`#${iframeId}`).append(movieTrailerHTML);
    })
    .catch(err => console.log(err));
}
  

//For transitiom of movie-item
function noHover() {
    $(this).find(".access").addClass("on-hover");
}

function Hover() {
    $(".access").addClass("on-hover");
    $(".movie-item").hover(function() {
        $(this).find(".access").removeClass("on-hover");
        //const movieId = $(this).attr("id");
        // setupButton();
    }, noHover);
}
  
  
// Navigation
function getMoviesByCategory(dataList, categoryName) {
    filteredResult = dataList.filter(movie => {
        if (movie.category.includes(categoryName)) {
            return true;
        }
        return false;
    });
    filteredData = {results : filteredResult};
    return filteredData;
}

function setActiveNavItem(activeItem) {
    $('.nav-items').removeClass('active');
    $(activeItem).addClass('active');
}

function setupNavigationFiltering() {
    const navItems = $('.nav-items');

    navItems.each(function() {
        $(this).click(() => {
            const navItemCat = $(this).attr('data-category');
            setActiveNavItem(this);
            filterContent(navItemCat);
        });
    });
}

function filterContent(category) {
    let data;

    if(category === "all"){
        data = tmdb_example;
        clearSections();
        fetchAndBuildAllSections(data, genre_data);
    }
    else if(category === "tv-shows") {
        data = getMoviesByCategory(tmdb_example.results, "TV Show");
        clearSections();
        fetchAndBuildAllSections(data, genre_data);
    }
    else if(category === "movies") {
        data = getMoviesByCategory(tmdb_example.results, "Film");
        clearSections();
        fetchAndBuildAllSections(data, genre_data);
    }
    else if(category === "news-popular") {
        data = getMoviesByCategory(tmdb_example.results, "News");
        clearSections();
        fetchAndBuildAllSections(data, genre_data);
    }
    else if(category === "my-list") {
        $(".main").hide();
        $(".language-filter").hide();
        $(".my-list").show();
    }
    else if (category === "languages") {
        $(".main").hide();
        $(".my-list").hide();
        $(".language-filter").show();
    }
}

function clearSections() {
    $(".my-list").hide();
    $(".language-filter").hide();
    $(".main").show();
    
    $('.movie').empty();
    $("#banner-section").css("background-image", "none");
    $('.banner').empty();
}


//Access Buttons
// function setupButton() {
//     const accessItems = $(".first.access-item");
//     // const movieItem = $(".first.access-item").closest(".movie-item");
//     const movieItem = $(".first.access-item").parent().parent();

//     accessItems.each(function() {
//         $(this).find("button").on('click', function() {
//             const accessItemCat = $(this).parent().attr("cat");
//             filterButtonContent(accessItemCat, movieItem);
//         });
//     });
// }

// function filterButtonContent(buttonCategory, movieItem) {
//     if(buttonCategory === "play-video") {
        
//     } 
//     else if(buttonCategory === "add-to-list") {
//         addToList(movieItem);
//         // Update button icon to tick mark
//         $(movieItem).find(".first.access-item[cat='add-to-list'] button img").attr("src", "./images/icons/tick.png");
//     } 
//     else if(buttonCategory === "like") {
        
//     } 
//     else if(buttonCategory === "dislike") {
        
//     }
//     else if(buttonCategory === "big-screen") {
        
//     }
// }


// // My list
// myList = {results : []};

// function addToList(movieItem) {
//     let container = $(".my-list.container");
//     let currRow = $(container).children().last();

//     // Clone the movie item to avoid direct manipulation
//     let clonedMovieItem = $(movieItem).clone();
//     $(currRow).append(clonedMovieItem);
// }





$(document).ready(function() {
    $('.access-item[cat="add-to-list"] button').on('click', function(event) {
        event.preventDefault();
        var movieItem = $(this).closest('.movie-item');
        var myListContainerRow = $('.my-list.container .my-row');

        // Check if the movie is already in the my-list
        if (myListContainerRow.find(movieItem).length > 0) {
            // Remove from my-list
            myListContainerRow.remove(movieItem);
            $(this).html('<img src="./images/icons/add.png">'); // Change button to add icon
        } else {
            // Add to my-list
            myListContainerRow.append(movieItem.clone()); // Clone the movie item to avoid direct manipulation
            $(this).html('<img src="./images/icons/tick.png">'); // Change button to checkmark icon
        }
    });
});


function scrollToSection(section) {
    if (section.length) {
        $('body > div').hide();
        section.show();
        $('html, body').animate({
            scrollTop: section.offset().top
        }, 500);

        window.location.hash = section.attr('id');
    }
}

// Scroll to the section when the hash changes
// Not opening because of credential login

// $(window).on('hashchange', function() {
//     const hash = window.location.hash;
//     if (hash) {
//         const section = $(hash);
//         scrollToSection(section);
//     }
// });