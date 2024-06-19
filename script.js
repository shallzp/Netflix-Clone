//Routing change
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

//Scroll to the section when the hash changes
//Not opening because of credential login
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


//Initial 
function init() {
    $(".ans").hide();

    // scrollToSection($("#get-started"));
    scrollToSection($("#front-sign-in"));
    // scrollToSection($("#manage-profiles"));

    fetchAndBuildAllSections(tmdb_example, genre_data);
    setupNavigationFiltering();

    $(".my-list").hide();
    $(".language-filter").hide();
}

$(document).ready(() => {
    init();


    var rememberMe = getCookie('rememberMe');
    if (rememberMe) {
        var credentials = rememberMe.split(':');
        $('#email-number').val(credentials[0]);
        $('#password').val(credentials[1]);
        $('#remember-me').prop('checked', true);
        currentUser = user_data.users.find(function (user) {
            return (credentials[0] === user.email || credentials[0] === user.username) && credentials[1] === user.password;
        });
    }


    if(localStorage.getItem('user_data')) {
        user_data = JSON.parse(localStorage.getItem('user_data'));
    }


    $(window).scroll(() => {
        if (window.scrollY > 5) {
            $("#header").addClass("black-bg");
        } 
        else {
            $("#header").removeClass("black-bg");
        }
    });
}); 

function home() {
    scrollToSection($("#home-page"));
}




//Front Page
function signUpBtn() {
    scrollToSection($("#sign-up"));
}

function getStarted() {
    var emailValue1 = $("#email1").val().trim();
    var emailValue2 = $("#email2").val().trim();

    if (emailValue1 !== "" || emailValue2 !== "") {
        scrollToSection($("#get-started"));
        return true;
    } 
    else {
        if (emailValue1 === "") {
            $("#email1").focus();
        } 
        else {
            $("#email2").focus();
        }
        return false;
    }
}

function toggleDiv(divCl) {
    $("." + divCl).toggle(250);
}



//Sign-in Page
//Remember Me
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {   
    document.cookie = name + '=; Max-Age=-99999999;';  
}

var currentUser = null;

function validateSignUp() {
    var isValid = true;

    var enumVal = $("#email-number").val();
    var isValidEmail = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(enumVal);
    //var isValidPhone = /^\d{10}$/.test(enumVal);
    if (!isValidEmail) {
        $(".email-error").show();
        isValid = false;
    }

    var password = $('#password').val();
    if (password.length < 4 || password.length > 60) {
        $(".pass-error").show();
        isValid = false;
    }

    if (isValid) {
        var user = user_data.users.find(function (user) {
            return (enumVal === user.email || enumVal === user.username) && password === user.password;
        });

        if (user) {
            currentUser = user;
            if ($('#remember-me').is(':checked')) {
                setCookie('rememberMe', enumVal + ':' + password, 7);
                console.log("Automatically logged in using cookie!");
            } 
            else {
                eraseCookie('rememberMe');
            }

            profilePage();

            return true;
        } 
        else {
            $(".invalid.credential").show();
            isValid = false;
        }
    }

    return isValid;
}




//After sign in

//Manage Profiles
function profileInit() {
    $(".profiles").empty();

    const addProfileHTML = `
    <div class="user add-profile-icon">
        <img src="./images/icons/add-profile.png" onclick="addProfile()">
        <span>Add Profile</span>
    </div>
    `;

    $(".profiles").append(addProfileHTML);

    for(var i = 0; i < currentUser.profiles.length; i++) {
        const profileHTML = `
        <div class="user person" onclick="currentHome(this)">
            <img src=${currentUser.profiles[i].profile_pic}>
            <span>${currentUser.profiles[i].name}</span>
            <div class="manage-overlay" style="display: none;" onclick="manageUser(this)">
                <img src="./images/icons/edit.png">
            </div>
        </div>`; 
        
        $(".add-profile-icon").before(profileHTML);
    }

    if ($(".profiles .user").length - 1 >= 5) {
        $(".add-profile-icon").hide();
    } 
    else {
        $(".add-profile-icon").show();
    }

    $(".manage-overlay").hide();
}

function activeProfile() {
    for(var i = 0; i < currentUser.profiles.length; i++) {
        if(currentUser.profiles[i].active === true) {
            currentProfile = currentUser.profiles[i];
            $(".nav-right-item .user").attr("src", currentProfile.profile_pic);
        }
    }
}

function setActive(profile) {
    const profile_name = $(profile).find("span").text().trim();

    for(var i = 0; i < currentUser.profiles.length; i++) {
        currentUser.profiles[i].active = (profile_name === currentUser.profiles[i].name);
    }

    localStorage.setItem('user_data', JSON.stringify(user_data));

    activeProfile();
}

function currentHome(profile) {
    setActive(profile);
    scrollToSection($("#home-page"));
    initializeButtons();
    activeProfile();
}


//Opens add profile page
function addProfile() {
    scrollToSection($("#manage-profiles"), "add-profile");
    $(".profile-list").hide();
    $(".add-profile").show();
}

function createProfile() {
    const profile_name = $(".profile-name").val();
    const profile_pic = $(".add-profile form .user-img").attr("src");
    const isKid = $(".kid-profile").is(":checked");

    const newProfile = {
        name : profile_name,
        kid : isKid,
        language : "English",
        allowed: isKid ? "For Little Kids only" : "All Maturity levels",
        profile_pic : profile_pic,
        active : false,
        watchlist : { results : []},
        like : { results : []},
        dislike : { results : []},
    }

    const profileHTML = `
        <div class="user">
            <img src=${profile_pic}>
            <span>${profile_name}</span>
            <div class="manage-overlay" style="display: none;" onclick="manageUser(this)">
                <img src="./images/icons/edit.png">
            </div>
        </div>`;

    if(profile_name !== "") {
        currentUser.profiles.push(newProfile);
        $(".add-profile-icon").before(profileHTML);

        localStorage.setItem('user_data', JSON.stringify(user_data));

        profilePage();
        return true;
    }

    return false;
}


//Manage user
function manageProfile() {
    $(".manage-overlay").toggle();
}

function manageUser(img) {
    const name = $(img).prev("span").text().trim();

    scrollToSection($("#manage-profiles"), "manage-user");
    $(".profile-list").hide();
    $(".manage-user").show();

    let current_profile = null;

    for (let i = 0; i < currentUser.profiles.length; i++) {
        if (currentUser.profiles[i].name === name) {
            current_profile = currentUser.profiles[i];
            break;
        }
    }

    if (current_profile) {
        $(".manage-user .profile-name").val(current_profile.name);
        $("#acc-lang .selected").text(current_profile.language);
        $("#allowed .selected").text(current_profile.allowed);
        $(".manage-user .user-img").prop("src", current_profile.profile_pic);
        if(current_profile.kid === true) {
            $(".manage-user .kid-profile").prop("checked", true);
        }
    }
}

const acc_drop = $(".acc-dropdown");
acc_drop.each(function() {
    const dropdown = $(this);

    dropdown.find(".select").click(function() {
        $(this).toggleClass("select-clicked");
        dropdown.find(".menu").toggleClass("menu-open");
    });

    dropdown.find(".menu li").each(function() {
        const option = $(this);

        option.click(function() {
            dropdown.find(".selected").text($(this).text());
            dropdown.find(".select").removeClass("select-clicked");
            dropdown.find(".menu").removeClass("menu-open");
        
            dropdown.find(".menu li").removeClass("dropdown-active");
            option.addClass("dropdown-active");
        });
    });
});

function editProfile() {
    const profile_name = $(".manage-user .profile-name").val();
    const profile_pic = $(".manage-user form .user-img").attr("src");
    const isKid = $(".manage-user .kid-profile").is(":checked");
    // const language = $("#acc-lang .selected").text().trim();
    const allowed = $("#allowed .selected").text().trim();

    for(var i = 0; i < currentUser.profiles.length; i++) {
        if(profile_name === currentUser.profiles[i].name) {
            currentUser.profiles[i].name = profile_name;
            currentUser.profiles[i].kid = isKid;
            // currentUser.profiles[i].language = language;
            currentUser.profiles[i].allowed = allowed;
            currentUser.profiles[i].profile_pic = profile_pic;
            currentUser.profiles[i].active = false;

            localStorage.setItem('user_data', JSON.stringify(user_data));

            profilePage();
            $(".manage-overlay").hide();
            return true;
        }
    }

    return false;
}

function deleteProfile() {
    const profile_name = $(".manage-user .profile-name").val();

    for (var i = 0; i < currentUser.profiles.length; i++) {
        if (profile_name === currentUser.profiles[i].name) {
            currentUser.profiles.splice(i, 1);
            break;
        }
    }
    
    $(".profile-list .user").each(function() {
        if ($(this).find("span").text().trim() === profile_name) {
            $(this).remove();
        }
    });

    localStorage.setItem('user_data', JSON.stringify(currentUser));

    profilePage();
    $(".manage-overlay").hide();
}


//For change in profile-pic
function profileLogo(selector) {
    $(selector).show();
}

function changePicture(img) {
    const source = $(img).attr("src");
    $(img).closest("div").next("form").find(".user-img").attr("src", source);
    $(".upper").hide();
}



//Main Netflix
//Navigation
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
        initializeWatchlist();
    }
    else if (category === "languages") {
        $(".main").hide();
        $(".my-list").hide();
        $(".language-filter").show();
        initializeFilter(tmdb_example.results);
    }

    window.location.hash = "home-page" + '?' + category ;
    initializeButtons();
}

function clearSections() {
    $(".my-list").hide();
    $(".language-filter").hide();
    $(".search-list").hide();
    $(".main").show();
    
    $('.movie').empty();
    $("#banner-section").css("background-image", "none");
    $('.banner').empty();
}


//Search
$(".search").click(() => {
    $(".navbar").css("grid-template-columns", "0.1fr 0.7fr 0.2fr");
    $(".search").hide();
    $(".search-box").show();
    $(".main").hide();
    $(".search-list").show();
})


//Dropdown
$(".dropdown").click(() => {
    $(".drop-options.manage").prevAll(".drop-options").remove();

    for (var i = 0; i < currentUser.profiles.length; i++) {
        const profilePic = currentUser.profiles[i].profile_pic;
        const profileName = currentUser.profiles[i].name;

        const dropHTML = `
        <li class="drop-options" onclick="setActive(this)"> 
            <img src="${profilePic}">
            <span>${profileName}</span>    
        </li>`;

        $(".drop-options.manage").before(dropHTML);
    }

    $(".dropdown-content").toggleClass("menu-toggle");
});

function profilePage() {
    scrollToSection($("#manage-profiles"), "profile-list");
    profileInit();
    $(".profile-list").show();
    $(".manage-user").hide();
    $(".add-profile").hide();
}


//Builds Banner
function buildBanner(movieItem) {
    $("#banner-section").css("background-image", `url(${movieItem.banner})`);

    const bannerSectionHTML = `
    <div class="banner-content container">
        <h2 class="banner-title">${movieItem.title}</h2>
        <p class="banner-info">Watch This now</p>
        <p class="banner-overview">${movieItem.overview}</p>
        <div class="action-buttons">
            <button class="action"><img src="./images/icons/play.png">Play</button>
            <button class="action"><img src="./images/icons/info.png">More Info</button>
        </div>
    </div>
    `;

    $("#banner-section").append(bannerSectionHTML);
}


//Fetches each genre and builds sections for it
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


//Returns result array with popularity higher than the threshold
function getMoviesByPopularity(data, threshold) {
    return data.results.filter(movie => movie.popularity > threshold);
}

function fetchAndBuildTrending(data) {
    const trendingData = getMoviesByPopularity(data, 80);
    buildMovieSection(trendingData, "Trending Now");

    const randomIndex = Math.floor(Math.random() * trendingData.length);
    buildBanner(trendingData[randomIndex]);
}


//Returns results array that have genre id
function getMoviesByGenreId(data, genreId) {
    return data.results.filter(movie => movie.genre_ids.includes(genreId));
}

//Fetches each movie with different genre ids
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

    const movieListHTML = dataList.map(item => createMovieItem(item)).join('');

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

//Brings movie trailer from youtube api
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

        $(`#${iframeId}`).html(movieTrailerHTML);
    })
    .catch(err => console.log(err));
}


//Builds movie item
function createMovieItem(item) {
    const genres = item.genre_ids.map(id => genre_data.genre.find(genre => genre.id === id)?.name);
    const filteredGenres = genres.filter(genreName => genreName);
    const genreList = filteredGenres.join(', ');

    // onmouseover="searchMovieTrailer('${item.title}', 'yt${item.id}')"
    return `
    <div class="movie-item" id="${item.id}">
        <img class="movie-item-img" src="${item.backdrop_path}" alt="${item.title}">
        <div class="yt-iframe" id="yt${item.id}"></div>
        
        <div class="access">
            <ul class="first">
                <li class="access-item" cat="play-video"><button><img src="./images/icons/play-circle.png"></button></li>
                <li class="access-item" cat="add-to-list"><button><img src="./images/icons/add.png"></button></li>
                <li class="access-item" cat="like"><button><img src="./images/icons/like.png"></button></li>
                <li class="access-item" cat="dislike"><button><img src="./images/icons/dislike.png"></button></li>
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
}
  
//For transition of movie-item
function noHover() {
    $(this).find(".access").addClass("on-hover");
    $(this).closest('.movie-row').css('overflow', 'auto');
}

function Hover() {
    $(".access").addClass("on-hover");
    $(".movie-item").hover(function() {
        $(this).find(".access").removeClass("on-hover");
        $(this).closest('.movie-row').css('overflow', 'visible');

        var movieId = $(this).attr('id');
        for (var i = 0; i < tmdb_example.results.length; i++) {
            if (tmdb_example.results[i].id === movieId) {
                movieName = tmdb_example.results[i].title;
                searchMovieTrailer(movieName, `yt${movieId}`);
            }
        }
    }, noHover);
}


//Access Button
function initializeButtons() {
    $('.movie-item').each(function() {
        var movieItem = $(this);
        var movieId = movieItem.attr('id');


        //Watchlist
        var myList = currentUser.watchlist;

        var isInMyList = myList.results.some(movie => movie.id == movieId);

        var button = movieItem.find('.access-item[cat="add-to-list"] button');
        if (isInMyList) {
            button.html('<img src="./images/icons/tick.png">');
        } else {
            button.html('<img src="./images/icons/add.png">');
        }


        //Liked
        var liked = currentUser.like;

        var isLiked = liked.results.some(movie => movie.id == movieId);

        var button = movieItem.find('.access-item[cat="like"] button');
        if (isLiked) {
            button.html('<img src="./images/icons/liked.png">');
        } else {
            button.html('<img src="./images/icons/like.png">');
        }


        //Disliked
        var disliked = currentUser.dislike;

        var isDisliked = disliked.results.some(movie => movie.id == movieId);

        var button = movieItem.find('.access-item[cat="dislike"] button');
        if (isDisliked) {
            button.html('<img src="./images/icons/disliked.png">');
        } else {
            button.html('<img src="./images/icons/dislike.png">');
        }
    });
}

function initializeWatchlist() {
    var myList = currentUser.watchlist;

    var myListContainerRow = $('.my-list.container .my-row');

    for (var i = 0; i < myList.results.length; i++) {
        var movieId = myList.results[i].id;
    
        var existingMovie = myListContainerRow.find('.movie-item[id="' + movieId + '"]');
    
        if (existingMovie.length > 0) {
            return;
        }
        else {
            const myListHTML = myList.results.map(item => createMovieItem(item)).join('');
            $(".my-list.container .my-row").append(myListHTML);
            Hover();
        }
    }
}

//Play

//Add to list
$(document).on('click', '.access-item[cat="add-to-list"] button', function(event) {
    event.preventDefault();
    if (!currentUser) {
        alert('You must be signed in to manage your watchlist.');
        return;
    }

    var myList = currentUser.watchlist;

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
        //Removing if movie exists in the my list
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
        $(this).html('<img src="./images/icons/tick.png">');
    }

    localStorage.setItem('user_data', JSON.stringify(user_data));
});

//Like
$(document).on('click', '.access-item[cat="like"] button', function(event) {
    event.preventDefault();
    if (!currentUser) {
        alert('You must be signed in to manage your likes.');
        return;
    }

    var liked = currentUser.like;

    var movieItem = $(this).closest('.movie-item');
    var movieId = movieItem.attr('id');
    
    var movieDetails;
    for (var i = 0; i < tmdb_example.results.length; i++) {
        if (tmdb_example.results[i].id === movieId) {
            movieDetails = tmdb_example.results[i];
            break;
        }
    }

    var index = liked.results.findIndex(function(item) {
        return item.id === movieId;
    });

    if (index !== -1) {
        liked.results.splice(index, 1);
        $(this).html('<img src="./images/icons/like.png">');
    } 
    else {
        liked.results.push(movieDetails);
        $(this).html('<img src="./images/icons/liked.png">');
    }

    localStorage.setItem('user_data', JSON.stringify(user_data));
});

//Dislike 
$(document).on('click', '.access-item[cat="dislike"] button', function(event) {
    event.preventDefault();
    if (!currentUser) {
        alert('You must be signed in to manage your dislikes.');
        return;
    }

    var disliked = currentUser.dislike;

    var movieItem = $(this).closest('.movie-item');
    var movieId = movieItem.attr('id');
    
    var movieDetails;
    for (var i = 0; i < tmdb_example.results.length; i++) {
        if (tmdb_example.results[i].id === movieId) {
            movieDetails = tmdb_example.results[i];
            break;
        }
    }

    var index = disliked.results.findIndex(function(item) {
        return item.id === movieId;
    });

    if (index !== -1) {
        disliked.results.splice(index, 1);
        $(this).html('<img src="./images/icons/dislike.png">');
    } 
    else {
        disliked.results.push(movieDetails);
        $(this).html('<img src="./images/icons/disliked.png">');
    }
    localStorage.setItem('user_data', JSON.stringify(user_data));
});

//Enlarge


//Browse by language
const dropdowns = $(".lang-dropdown");
dropdowns.each(function() {
    const dropdown = $(this);

    dropdown.find(".select").click(function() {
        $(this).toggleClass("select-clicked");
        dropdown.find(".menu").toggleClass("menu-open");
    });

    dropdown.find(".menu li").each(function() {
        const option = $(this);

        option.click(function() {
            dropdown.find(".selected").text($(this).text());
            dropdown.find(".select").removeClass("select-clicked");
            dropdown.find(".menu").removeClass("menu-open");
        
            dropdown.find(".menu li").removeClass("dropdown-active");
            option.addClass("dropdown-active");
        });
    });
});

//Appends items in My Row
function initializeFilter(filterList) {
    const filterContainerRow = $('.language-filter.container .my-row');
    filterContainerRow.empty();

    const filterListHTML = filterList.map(item => createMovieItem(item)).join('');
    filterContainerRow.append(filterListHTML);
    Hover();
}

//Creates array of languages and adds to dropdown
function getOriginalLanguages(dataList) {
    const langSet = new Set();

    for (let i = 0; i < dataList.length; i++) {
        langSet.add(dataList[i].original_language);
    }

    const langArray = Array.from(langSet);
    return langArray;
}

function getDubbedLanguages(dataList) {
    const langSet = new Set();

    for (let i = 0; i < dataList.length; i++) {
        dataList[i].dubbed_language.forEach(language => {
            langSet.add(language);
        });
    }

    const langArray = Array.from(langSet);
    return langArray;
}

function getSubtitleLanguages(dataList) {
    const langSet = new Set();

    for (let i = 0; i < dataList.length; i++) {
        dataList[i].subtitles.forEach(language => {
            langSet.add(language);
        });
    }

    const langArray = Array.from(langSet);
    return langArray;
}

function appendLanguagesToList(langArray) {
    langArray.forEach(language => {
        const li = `<li>${language}</li>`
        $("#language .menu").append(li);
    });
}

$("#type").find(".menu li").each(function() { 
    const option = $(this);

    option.click(function() {
        $("#language .menu").empty();
        const language = $(this).text();

        if(language === "Original Language"){
            appendLanguagesToList(getOriginalLanguages(tmdb_example.results));
        }
        else if(language === "Dubbing"){
            appendLanguagesToList(getDubbedLanguages(tmdb_example.results));
        }
        else if(language === "Subtitles"){
            appendLanguagesToList(getSubtitleLanguages(tmdb_example.results));
        }
    });
});

//Gets movie with particular type of language
function filterByLanguage(dataList, type, language) {
    return dataList.filter(movie => movie[type].includes(language));
}

$("#language").on('click', '.menu li', function() {
    const type_text = $("#type .selected").text().trim();
    let type = "";

    if (type_text === "Original Language") {
        type = "original_language";
    } else if (type_text === "Dubbing") {
        type = "dubbed_language";
    } else if (type_text === "Subtitles") {
        type = "subtitles";
    }

    const language = $(this).text().trim();
    const dataList = filterByLanguage(tmdb_example.results, type, language);
    initializeFilter(dataList);
});

//Filter by sorting
function sortMoviesByTitle(movies, descending = false) {
    return movies.sort((a, b) => {
      if (a.title < b.title) return descending ? 1 : -1;
      if (a.title > b.title) return descending ? -1 : 1;
      return 0;
    });
}

$("#filter").find(".menu li").each(function() {
    const type_text = $("#type .selected").text().trim();
    let type = "";

    if (type_text === "Original Language") {
        type = "original_language";
    } 
    else if (type_text === "Dubbing") {
        type = "dubbed_language";
    } 
    else if (type_text === "Subtitles") {
        type = "subtitles";
    }

    const language = $("#language .selected").text().trim();

    let filteredData = filterByLanguage(tmdb_example.results, type, language);

    const option = $(this);

    option.click(function() {
        const filter = $(this).text().trim();

        let dataList;

        if (filter === "Year Released") {
            dataList = sortByReleaseDate(filteredData);
        } else if (filter === "A-Z") {
            dataList = sortMoviesByTitle(filteredData);
        } else if (filter === "Z-A") {
            dataList = sortMoviesByTitle(filteredData, true);
        }

        // Initialize the filter with the sorted data
        initializeFilter(dataList);
    });
});