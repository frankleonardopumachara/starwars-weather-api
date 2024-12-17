import axios from 'axios';
import { fetchWeatherData } from './weatherService'; // Importamos la función que queremos probar

// Mock de axios
jest.mock('axios');

describe('weatherService', () => {
    const latitude = 52.52;
    const longitude = 13.405;
    const weatherData = {
        current_weather: {
            temperature: 18.5,
            // Otros datos que pueda devolver la API
        },
    };

    beforeEach(() => {
        // Limpiar todos los mocks antes de cada prueba
        jest.clearAllMocks();
    });

    test('should fetch and return weather data from the Open-Meteo API', async () => {
        // Simulamos la respuesta exitosa de axios.get
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: weatherData });

        const result = await fetchWeatherData(latitude, longitude);

        // Verificamos que axios.get se llame con la URL y parámetros correctos
        expect(axios.get).toHaveBeenCalledWith('https://api.open-meteo.com/v1/forecast', {
            params: { latitude, longitude, current_weather: true },
        });

        // Verificamos que el resultado sea el esperado
        expect(result).toEqual(weatherData);
    });

    test('should handle errors if API call fails', async () => {
        const errorMessage = 'Network error';

        // Simulamos un error en la llamada a axios.get
        (axios.get as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        try {
            await fetchWeatherData(latitude, longitude);
        } catch (error) {
            // Verificamos que el error es el esperado
            expect(error.message).toBe(errorMessage);
        }

        // Verificamos que axios.get se haya llamado correctamente
        expect(axios.get).toHaveBeenCalledWith('https://api.open-meteo.com/v1/forecast', {
            params: { latitude, longitude, current_weather: true },
        });
    });
});