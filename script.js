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


    $('.scroll-left').click(function() {
        var movieRow = $(this).siblings('.movie-row');
        movieRow.scrollLeft(movieRow.scrollLeft() - 100);
    });
    
    $('.scroll-right').click(function() {
        var movieRow = $(this).siblings('.movie-row');
        movieRow.scrollLeft(movieRow.scrollLeft() + 100);
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
        <div class="movie-item" onmouseover="searchMovieTrailer('${item.title}', 'yt${item.id}')" id="${item.id}">
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
        <div class="movie-row-container">
            <button class="scroll-left">&lt;</button>
            <div class="movie-row">
                ${movieListHTML}
            </div>
            <button class="scroll-right">&gt;</button>
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
    $(this).closest('.movie-row').css('overflow', 'auto');
}

function Hover() {
    $(".access").addClass("on-hover");
    $(".movie-item").hover(function() {
        $(this).find(".access").removeClass("on-hover");
        $(this).closest('.movie-row').css('overflow', 'visible');
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

function sortByReleaseDate(dataList) {
    return dataList.sort((a, b) => {
        let dateA = new Date(a.release_date);
        let dateB = new Date(b.release_date);
        return dateB - dateA;
    });
}

function getLatestPopularShows(dataList, minResults = 20) {
    let sortedShows = sortByReleaseDate(dataList);

    return { results: sortedShows.slice(0, minResults) };
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
    else if(category === "new-popular") {
        data = getLatestPopularShows(tmdb_example.results);
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

    window.location.hash = "after-sign-in" + '?' + category ;
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


//Add to list
$(document).ready(() => {
    if(localStorage.getItem('myList')) {
        myList = JSON.parse(localStorage.getItem('myList'));
    }

    initializeButtons();

    setInterval(initializeButtons, 1000);
})

function initializeButtons() {
    $('.movie-item').each(function() {
        var movieItem = $(this);
        var movieId = movieItem.attr('id');

        // Check if the movie is in myList
        var isInMyList = false;
        for (var i = 0; i < myList.results.length; i++) {
            if (myList.results[i].id == movieId) {
                isInMyList = true;
                break;
            }
        }

        // Update the button icon based on the movie's presence in myList
        var button = movieItem.find('.access-item[cat="add-to-list"] button');
        if (isInMyList) {
            button.html('<img src="./images/icons/tick.png">');
        } 
        else {
            button.html('<img src="./images/icons/add.png">');
        }
    });
}

$(document).on('click', '.access-item[cat="add-to-list"] button', function(event) {
    event.preventDefault();
    var movieItem = $(this).closest('.movie-item');
    var movieId = movieItem.attr('id');
    var myListContainerRow = $('.my-list.container .my-row');

    var movieDetails;
    for (var i = 0; i < tmdb_example.results.length; i++) {
        if (tmdb_example.results[i].id === movieId) {
            movieDetails = tmdb_example.results[i];
            break;
        }
    }

    var existingMovie = myListContainerRow.find('.movie-item[id="' + movieId + '"]');
    if (existingMovie.length > 0) {
        // Removing if movie exists in the my list
        existingMovie.remove();
        $(this).html('<img src="./images/icons/add.png">');

        for (var j = 0; j < myList.results.length; j++) {
            if (myList.results[j].id == movieId) {
                myList.results.splice(j, 1);
                break;
            }
        }
    } 
    else {
        myList.results.push(movieDetails);

        var newMovieItem = movieItem.clone(); // Clone the movie
        newMovieItem.attr('id', movieId); // Set id attribute
        myListContainerRow.append(newMovieItem); // Append to my-list
        $(this).html('<img src="./images/icons/tick.png">');
    }

    localStorage.setItem('myList', JSON.stringify(myList));
});


// function scrollToSection(section) {
//     if (section.length) {
//         $('body > div').hide();
//         section.show();
//         $('html, body').animate({
//             scrollTop: section.offset().top
//         }, 500);

//         window.location.hash = section.attr('id');
//     }
// }

// // Scroll to the section when the hash changes
// // Not opening because of credential login

// $(window).on('hashchange', function() {
//     const hash = window.location.hash;
//     if (hash) {
//         const section = $(hash);
//         scrollToSection(section);
//     }
// });


function scrollToSection(section, dataCategory = '') {
    if (section.length) {
        $('body > div').hide();
        section.show();
        $('html, body').animate({
            scrollTop: section.offset().top
        }, 500);
        
        const hash = section.attr('id') + '?' + dataCategory;
        window.location.hash = hash;
    }
}

// Scroll to the section when the hash changes
// Not opening because of credential login

$(window).on('hashchange', function() {
    const { section, dataCategory } = getSectionFromHash();
    if (section.length) {
        scrollToSection(section, dataCategory);
    }
});

function getSectionFromHash() {
    const hash = window.location.hash;
    if (!hash) return { section: $(), dataCategory: '' };

    const [sectionId, dataCategory] = hash.slice(1).split('?');
    const section = $('#' + sectionId);
    return { section, dataCategory };
}