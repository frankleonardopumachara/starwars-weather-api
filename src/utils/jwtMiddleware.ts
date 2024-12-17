import * as jwt from 'jsonwebtoken';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret';

export const verifyToken = async (
    event: APIGatewayEvent
): Promise<APIGatewayProxyResult | void> => {
    const token = event.headers?.Authorization || event.headers?.authorization;

    if (!token) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'No token provided' }),
        };
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY);
        // Adjuntar los datos decodificados al contexto para su uso en el handler
        (event as any).user = decoded;
    } catch (err) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Unauthorized: Invalid token' }),
        };
    }
};