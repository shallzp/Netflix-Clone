const yt_api_key = "AIzaSyDE1-U79ej6aoXFkqJWRMw87WZX4JAr8gQ";
const yt_api_path = (query) => `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${yt_api_key}`;