import axios from 'axios';
import { fetchStarWarsData } from './swapiService'; // Importamos la función que queremos probar

// Mock de axios
jest.mock('axios');

describe('swapiService', () => {
    const planetId = 1;
    const planetData = {
        name: 'Tatooine',
        climate: 'Arid',
        population: 200000,
        // Otros datos que pueda devolver la API
    };

    beforeEach(() => {
        // Limpiar todos los mocks antes de cada prueba
        jest.clearAllMocks();
    });

    test('should fetch and return planet data from Star Wars API', async () => {
        // Simulamos la respuesta exitosa de axios.get
        (axios.get as jest.Mock).mockResolvedValueOnce({data: planetData});

        const result = await fetchStarWarsData(planetId);

        expect(axios.get).toHaveBeenCalledWith(`https://swapi.dev/api/planets/${ planetId }/`); // Verificamos que axios.get se llama con la URL correcta
        expect(result).toEqual(planetData); // Verificamos que el resultado es el esperado
    });

    test('should handle errors if API call fails', async () => {
        const errorMessage = 'Network error';

        // Simulamos un error en la llamada a axios.get
        (axios.get as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        try {
            await fetchStarWarsData(planetId);
        } catch (error) {
            // Verificamos que el error es el esperado
            expect(error.message).toBe(errorMessage);
        }

        expect(axios.get).toHaveBeenCalledWith(`https://swapi.dev/api/planets/${ planetId }/`); // Verificamos que axios.get se llamó correctamente
    });
});