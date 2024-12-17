import * as jwt from 'jsonwebtoken';
import { verifyToken } from './jwtMiddleware'; // Importamos la función que queremos probar
import { APIGatewayEvent } from 'aws-lambda';

jest.mock('jsonwebtoken');

describe('verifyToken', () => {
    const SECRET_KEY = process.env.JWT_SECRET || 'default_secret';

    let mockEvent: APIGatewayEvent;

    beforeEach(() => {
        // Limpiar todos los mocks antes de cada prueba
        jest.clearAllMocks();

        mockEvent = {
            headers: {
                Authorization: 'Bearer validtoken',
            },
        } as unknown as APIGatewayEvent; // Simulamos un evento de API Gateway
    });

    test('should return 401 if no token is provided', async () => {
        const noTokenEvent = { ...mockEvent, headers: {} }; // Eliminamos el token

        const result = await verifyToken(noTokenEvent);

        expect(result).toEqual({
            statusCode: 401,
            body: JSON.stringify({ message: 'No token provided' }),
        });
    });

    test('should return 401 if token is invalid', async () => {
        // Simulamos una función jwt.verify que lance un error
        (jwt.verify as jest.Mock).mockImplementationOnce(() => {
            throw new Error('Invalid token');
        });

        const result = await verifyToken(mockEvent);

        expect(result).toEqual({
            statusCode: 401,
            body: JSON.stringify({ message: 'Unauthorized: Invalid token' }),
        });
    });

    test('should proceed with valid token and attach user to event', async () => {
        const decodedToken = { userId: 1, username: 'testuser' };

        // Simulamos que jwt.verify devuelve un token decodificado correctamente
        (jwt.verify as jest.Mock).mockImplementationOnce(() => decodedToken);

        const result = await verifyToken(mockEvent);

        expect(result).toBeUndefined(); // No debe retornar nada si es válido
        expect((mockEvent as any).user).toEqual(decodedToken); // Verificamos que el token decodificado se adjunte al evento
    });
});