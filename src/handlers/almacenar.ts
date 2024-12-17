import { DynamoDB } from 'aws-sdk';
import { verifyToken } from '../utils/jwtMiddleware';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler = async (event) => {
    const authError = await verifyToken(event);
    if (authError) return authError;

    const body = JSON.parse(event.body);
    const params = { TableName: 'CustomData', Item: { ...body, createdAt: Date.now() } };

    await dynamoDb.put(params).promise();

    return { statusCode: 201, body: JSON.stringify({ message: "Data stored successfully" }) };
};