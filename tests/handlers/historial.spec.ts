import { handler } from './historial'; // Importamos el handler que queremos probar
import { DynamoDB } from 'aws-sdk'; // Importamos DynamoDB
import { verifyToken } from '../utils/jwtMiddleware'; // Importamos la función de verificación del token

// Mock de DynamoDB DocumentClient
jest.mock('aws-sdk', () => {
    const scanMock = jest.fn().mockResolvedValue({ Items: [{ id: 1, data: 'test data' }] }); // Simulamos el método scan
    return {
        DynamoDB: {
            DocumentClient: jest.fn().mockImplementation(() => ({
                scan: scanMock,
            })),
        },
    };
});

// Mock de la función verifyToken
jest.mock('../utils/jwtMiddleware', () => ({
    verifyToken: jest.fn(),
}));

describe('GET /historial', () => {
    let event: any;

    beforeEach(() => {
        event = {
            queryStringParameters: {},
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

    test('should return data from DynamoDB', async () => {
        const expectedData = [{ id: 1, data: 'test data' }];

        const result = await handler(event);

        expect(result.statusCode).toBe(200);
        expect(result.body).toContain('test data');
        expect(DynamoDB.DocumentClient.prototype.scan).toHaveBeenCalledWith({
            TableName: 'CustomData',
            ScanIndexForward: false,
        });
        expect(result.body).toContain(JSON.stringify(expectedData));
    });

    test('should handle DynamoDB errors gracefully', async () => {
        // Simulamos un error de DynamoDB
        (DynamoDB.DocumentClient.prototype.scan as jest.Mock).mockRejectedValueOnce(new Error('DynamoDB error'));

        const result = await handler(event);

        expect(result.statusCode).toBe(500);
        expect(result.body).toContain('DynamoDB error');
    });
});