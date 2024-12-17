import { getCachedData, setCacheData } from './cacheService'; // Importamos las funciones que queremos probar
import { DynamoDB } from 'aws-sdk'; // Importamos DynamoDB

// Mock de DynamoDB DocumentClient
jest.mock('aws-sdk', () => {
    const getMock = jest.fn();
    const putMock = jest.fn();

    return {
        DynamoDB: {
            DocumentClient: jest.fn().mockImplementation(() => ({
                get: getMock,
                put: putMock,
            })),
        },
    };
});

describe('CacheService', () => {
    const dynamoDbMock = new DynamoDB.DocumentClient();
    const key = 'testKey';
    const data = { some: 'cached data' };
    const timestamp = Date.now();

    beforeEach(() => {
        // Limpiar mocks antes de cada prueba
        jest.clearAllMocks();
    });

    test('should return cached data if it exists and is not expired', async () => {
        // Simulamos una respuesta de DynamoDB que contiene los datos y un timestamp válido
        dynamoDbMock.get.mockResolvedValueOnce({
            Item: { key, data, timestamp },
        });

        const result = await getCachedData(key);

        expect(result).toEqual(data); // Los datos deben ser los mismos que los almacenados en DynamoDB
        expect(dynamoDbMock.get).toHaveBeenCalledWith({ TableName: 'CacheTable', Key: { key } });
    });

    test('should return null if cached data is expired', async () => {
        // Simulamos que los datos en DynamoDB han expirado (timestamp más antiguo que CACHE_TTL)
        const expiredTimestamp = Date.now() - 2 * 60 * 60 * 1000; // 2 horas atrás
        dynamoDbMock.get.mockResolvedValueOnce({
            Item: { key, data, timestamp: expiredTimestamp },
        });

        const result = await getCachedData(key);

        expect(result).toBeNull(); // Si los datos han expirado, la función debe retornar null
        expect(dynamoDbMock.get).toHaveBeenCalledWith({ TableName: 'CacheTable', Key: { key } });
    });

    test('should return null if no data found in cache', async () => {
        // Simulamos que no se encuentran datos en DynamoDB
        dynamoDbMock.get.mockResolvedValueOnce({
            Item: null,
        });

        const result = await getCachedData(key);

        expect(result).toBeNull(); // Si no hay datos en cache, debe devolver null
        expect(dynamoDbMock.get).toHaveBeenCalledWith({ TableName: 'CacheTable', Key: { key } });
    });

    test('should store data in cache with correct timestamp', async () => {
        // Llamamos a setCacheData con un nuevo valor
        await setCacheData(key, data);

        expect(dynamoDbMock.put).toHaveBeenCalledWith({
            TableName: 'CacheTable',
            Item: { key, data, timestamp: expect.any(Number) }, // Verificamos que el timestamp sea un número (actual)
        });
    });
});