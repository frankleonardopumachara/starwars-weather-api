import { handler } from '../handlers/fusionados'; // Importamos el handler que queremos probar
import { getCachedData, setCacheData } from '../services/cacheService'; // Importamos las funciones de cache
import { getFusionData } from '../services/fusionService'; // Importamos la función de fusión de datos
import { verifyToken } from "../utils/jwtMiddleware"; // Importamos la función de verificación del token

// Mock de las funciones externas
jest.mock('../services/cacheService', () => ({
    getCachedData: jest.fn(),
    setCacheData: jest.fn(),
}));

jest.mock('../services/fusionService', () => ({
    getFusionData: jest.fn(),
}));

jest.mock('../utils/jwtMiddleware', () => ({
    verifyToken: jest.fn(),
}));

describe('GET /fusionados', () => {
    let event: any;

    beforeEach(() => {
        event = {
            queryStringParameters: { planetId: '1' },
            headers: { Authorization: 'Bearer fake-token' },
        };

        // Limpiar mocks antes de cada prueba
        (getCachedData as jest.Mock).mockClear();
        (setCacheData as jest.Mock).mockClear();
        (getFusionData as jest.Mock).mockClear();
        (verifyToken as jest.Mock).mockResolvedValue(undefined);
    });

    test('should return 401 if token is invalid', async () => {
        // Simulamos una respuesta de error de verificación de token
        (verifyToken as jest.Mock).mockResolvedValueOnce({
            statusCode: 401,
            body: JSON.stringify({ message: 'Unauthorized' }),
        });

        const result = await handler(event);

        expect(result.statusCode).toBe(401);
        expect(result.body).toContain('Unauthorized');
    });

    test('should return data from cache if available', async () => {
        const cachedData = { some: 'cached data' };
        (getCachedData as jest.Mock).mockResolvedValueOnce(cachedData);

        const result = await handler(event);

        expect(result.statusCode).toBe(200);
        expect(result.body).toContain('cached data');
        expect(getCachedData).toHaveBeenCalledWith('fusion_1');
        expect(getFusionData).not.toHaveBeenCalled(); // No se debe llamar a getFusionData si hay datos en cache
    });

    test('should fetch data if not found in cache and store it in cache', async () => {
        const fusionData = { some: 'fusion data' };
        (getCachedData as jest.Mock).mockResolvedValueOnce(null); // No hay datos en cache
        (getFusionData as jest.Mock).mockResolvedValueOnce(fusionData); // Se debe consultar getFusionData

        const result = await handler(event);

        expect(result.statusCode).toBe(200);
        expect(result.body).toContain('fusion data');
        expect(getCachedData).toHaveBeenCalledWith('fusion_1');
        expect(getFusionData).toHaveBeenCalledWith(1); // Se debe llamar a getFusionData con el planetId
        expect(setCacheData).toHaveBeenCalledWith('fusion_1', fusionData); // Los datos deben ser almacenados en cache
    });

    test('should handle errors when fetching fusion data', async () => {
        // Simulamos que ocurre un error al obtener los datos fusionados
        (getCachedData as jest.Mock).mockResolvedValueOnce(null);
        (getFusionData as jest.Mock).mockRejectedValueOnce(new Error('Fusion data error'));

        const result = await handler(event);

        expect(result.statusCode).toBe(500);
        expect(result.body).toContain('Fusion data error');
    });
});