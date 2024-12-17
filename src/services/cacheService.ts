import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();
const CACHE_TTL = 1800; // 30 minutos

export const getCachedData = async (key: string) => {
    const params = { TableName: 'CacheTable', Key: { key } };
    const data = await dynamoDb.get(params).promise();

    if (data.Item && (Date.now() - data.Item.timestamp < CACHE_TTL * 1000)) {
        return data.Item.data;
    }
    return null;
};

export const setCacheData = async (key: string, data: any) => {
    const params = {
        TableName: 'CacheTable',
        Item: { key, data, timestamp: Date.now() },
    };
    await dynamoDb.put(params).promise();
};