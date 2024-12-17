import { handler } from './almacenar'; // Importamos el handler que queremos probar
import { DynamoDB } from 'aws-sdk'; // Importamos DynamoDB
import { verifyToken } from '../utils/jwtMiddleware'; // Importamos el middleware de JWT

// Mock de la librería DynamoDB
jest.mock('aws-sdk', () => {
    const putMock = jest.fn().mockResolvedValue({}); // Simulamos la función put de DynamoDB
    return {
        DynamoDB: {
            DocumentClient: jest.fn().mockImplementation(() => ({
                put: putMock,
            })),
        },
    };
});

// Mock de la función verifyToken
jest.mock('../utils/jwtMiddleware', () => ({
    verifyToken: jest.fn(),
}));

describe('POST /almacenar', () => {
    let event: any;

    beforeEach(() => {
        event = {
            body: JSON.stringify({ key: 'value' }),
            headers: { Authorization: 'Bearer fake-token' },
        };

        // Limpiar el mock de verifyToken antes de cada prueba
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

    test('should store data successfully in DynamoDB', async () => {
        // Ejecutamos el handler
        const result = await handler(event);

        // Verificamos que la respuesta tenga el código de estado correcto
        expect(result.statusCode).toBe(201);
        expect(result.body).toContain('Data stored successfully');

        // Verificamos que la función put de DynamoDB haya sido llamada con los parámetros correctos
        const params = {
            TableName: 'CustomData',
            Item: expect.objectContaining({
                key: 'value',
                createdAt: expect.any(Number),
            }),
        };
        expect(DynamoDB.DocumentClient.prototype.put).toHaveBeenCalledWith(params);
    });

    test('should handle DynamoDB errors', async () => {
        // Simulamos un error de DynamoDB
        (DynamoDB.DocumentClient.prototype.put as jest.Mock).mockRejectedValueOnce(new Error('DynamoDB error'));

        const result = await handler(event);

        // Verificamos que el handler gestione el error de forma correcta
        expect(result.statusCode).toBe(500);
        expect(result.body).toContain('Internal Server Error');
    });
});