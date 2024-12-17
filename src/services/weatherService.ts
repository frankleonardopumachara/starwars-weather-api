import axios from 'axios';
import dotenv from "dotenv"

dotenv.config();

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

export const fetchWeatherData = async (latitude: number, longitude: number) => {
    const response = await axios.get(WEATHER_API_URL, {
        params: { latitude, longitude, current_weather: true },
    });
    return response.data;
};