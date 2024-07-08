const cityinput = document.querySelector(".search");
const searchbtn = document.querySelector(".searchbtn");
const locationbtn=document.querySelector(".locationbtn");
const weathercarddiv = document.querySelector(".weathercards");
const currentweatherdiv = document.querySelector(".citydetails");
const API_KEY = "9e59a7e755cc867fb9bec2fbb032ebdd";

const apiKey = 'API_KEY';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

fetch(`${apiUrl}?q=London&appid=${apiKey}`)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));


const createCurrentWeatherCard = (cityname, weatheritem) => {
    return `
        <div class="cityname">${cityname}</div>
        <div class="date">${weatheritem.dt_txt.split(" ")[0]}</div>
        <br/>
        <br/>
        
        <div class="temp">${(weatheritem.main.temp - 273.15).toFixed(2)}&deg;C</div>
        <br/>
        <div class="wind">Wind speed:${weatheritem.wind.speed}m/s</div>
        <br/>
        <div class="humid">Humidity: ${weatheritem.main.humidity}%</div>
        <div class="icon">
            <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@4x.png" alt="weather icon"/>
            <h4>${weatheritem.weather[0].description}</h4>
        </div>
    `;
};

const createForecastCard = (weatheritem) => {
    return `
        <li class="card">
            <h3>${weatheritem.dt_txt.split(" ")[0]}</h3>
            <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@2x.png" alt="weather-icon">
            <h6>Temp: ${(weatheritem.main.temp - 273.15).toFixed(2)}&deg;C</h6>
            <h6>Wind: ${weatheritem.wind.speed}m/s</h6>
            <h6>Humidity: ${weatheritem.main.humidity}%</h6>
        </li>
    `;
};

const getweather = (cityname, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            // Getting daily forecasts
            const uniqueforecastdays = [];
            const fivedaysforecast = data.list.filter(forecast => {
                const forecastdate = new Date(forecast.dt_txt).getDate();
                if (!uniqueforecastdays.includes(forecastdate)) {
                    return uniqueforecastdays.push(forecastdate);
                }
            });

            // Clearing previous data
            cityinput.value = "";
            weathercarddiv.innerHTML = "";
            currentweatherdiv.innerHTML = "";

            // Adding current weather
            currentweatherdiv.insertAdjacentHTML("beforeend", createCurrentWeatherCard(cityname, fivedaysforecast[0]));

            // Adding forecast cards
            fivedaysforecast.forEach((weatheritem, index) => {
                if (index !== 0) {
                    weathercarddiv.insertAdjacentHTML("beforeend", createForecastCard(weatheritem));
                }
            });

        })
        .catch(() => {
            alert("Error occurred while fetching the weather forecast");
        });
};

// Getting city coordinates
const getcoordinates = () => {
    const cityname = cityinput.value.trim();
    if (!cityname) return;

    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityname}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityname}`);
            const { name, lat, lon } = data[0];
            getweather(name, lat, lon);
        })
        .catch(() => {
            alert("Error occurred while fetching the coordinates");
        });
};
const getusercoordinates=()=>{
    navigator.geolocation.getCurrentPosition(
        position=>{
            const{latitude,longitude}=position.coords;
            const REVERSE_GEOCODING_URL=`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL)
        .then(res => res.json())
        .then(data => {
          //console.log(data);   
          const { name } = data[0];
            getweather(name, latitude, longitude);  
   

        })
        .catch(() => {
            alert("Error occurred while fetching the city");
        });



        },
        error=>{
            if(error.code===error.PERMISSION_DENIED){
                alert("Location request denied")
            }
        }
    );
}

searchbtn.addEventListener("click", getcoordinates);
locationbtn.addEventListener("click",getusercoordinates);
