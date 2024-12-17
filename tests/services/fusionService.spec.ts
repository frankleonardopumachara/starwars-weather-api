import { getFusionData } from './fusionService'; // Importamos la función que queremos probar
import { fetchStarWarsData } from './swapiService'; // Importamos la función fetchStarWarsData
import { fetchWeatherData } from './weatherService'; // Importamos la función fetchWeatherData

// Mock de las funciones fetchStarWarsData y fetchWeatherData
jest.mock('./swapiService', () => ({
    fetchStarWarsData: jest.fn(),
}));

jest.mock('./weatherService', () => ({
    fetchWeatherData: jest.fn(),
}));

describe('fusionService', () => {
    const planetId = 1;
    const planetData = {
        name: 'Tatooine',
        climate: 'Arid',
        population: 200000,
        latitude: 32.8,
        longitude: 29.9,
    };
    const weatherData = {
        current_weather: {
            temperature: 35,
        },
    };

    beforeEach(() => {
        // Limpiar mocks antes de cada prueba
        jest.clearAllMocks();
    });

    test('should return fused data from StarWars and weather APIs', async () => {
        // Simulamos las respuestas de las APIs
        (fetchStarWarsData as jest.Mock).mockResolvedValueOnce(planetData);
        (fetchWeatherData as jest.Mock).mockResolvedValueOnce(weatherData);

        const result = await getFusionData(planetId);

        expect(fetchStarWarsData).toHaveBeenCalledWith(planetId); // Verificamos que fetchStarWarsData se llame con el planetId
        expect(fetchWeatherData).toHaveBeenCalledWith(planetData.latitude, planetData.longitude); // Verificamos que fetchWeatherData se llame con las coordenadas correctas

        // Verificamos que los datos fusionados son correctos
        expect(result).toEqual({
            planet: 'Tatooine',
            climate: 'Arid',
            population: 200000,
            weather: 35,
            unit: 'Celsius',
        });
    });

    test('should handle errors if fetchStarWarsData fails', async () => {
        // Simulamos que fetchStarWarsData falla
        (fetchStarWarsData as jest.Mock).mockRejectedValueOnce(new Error('StarWars API error'));

        const result = await getFusionData(planetId);

        expect(fetchStarWarsData).toHaveBeenCalledWith(planetId);
        expect(result).toEqual({
            error: 'Error fetching StarWars data: StarWars API error',
        });
    });

    test('should handle errors if fetchWeatherData fails', async () => {
        // Simulamos que fetchStarWarsData es exitoso, pero fetchWeatherData falla
        (fetchStarWarsData as jest.Mock).mockResolvedValueOnce(planetData);
        (fetchWeatherData as jest.Mock).mockRejectedValueOnce(new Error('Weather API error'));

        const result = await getFusionData(planetId);

        expect(fetchStarWarsData).toHaveBeenCalledWith(planetId);
        expect(fetchWeatherData).toHaveBeenCalledWith(planetData.latitude, planetData.longitude);
        expect(result).toEqual({
            error: 'Error fetching Weather data: Weather API error',
        });
    });
});