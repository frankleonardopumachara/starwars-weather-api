import { fetchStarWarsData } from './swapiService';
import { fetchWeatherData } from './weatherService';

export const getFusionData = async (planetId: number) => {
    const planetData = await fetchStarWarsData(planetId);
    const weatherData = await fetchWeatherData(planetData.latitude, planetData.longitude);

    return {
        planet: planetData.name,
        climate: planetData.climate,
        population: planetData.population,
        weather: weatherData.current_weather.temperature,
        unit: "Celsius",
    };
};