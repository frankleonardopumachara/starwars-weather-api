import { DynamoDB } from 'aws-sdk';
import { verifyToken } from '../utils/jwtMiddleware';

export const handler = async (event) => {
    const authError = await verifyToken(event);
    if (authError) return authError;

    const dynamoDb = new DynamoDB.DocumentClient();
    const params = { TableName: 'CustomData', ScanIndexForward: false };

    const data = await dynamoDb.scan(params).promise();

    return { statusCode: 200, body: JSON.stringify(data.Items) };
};