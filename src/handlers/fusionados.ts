import { getCachedData, setCacheData } from '../services/cacheService';
import { getFusionData } from '../services/fusionService';
import { verifyToken } from "../utils/jwtMiddleware";

export const handler = async (event) => {
    const authError = await verifyToken(event);
    if (authError) return authError;

    const planetId = event.queryStringParameters?.planetId || 1;
    const cacheKey = `fusion_${ planetId }`;

    let data = await getCachedData(cacheKey);

    if (!data) {
        data = await getFusionData(planetId);
        await setCacheData(cacheKey, data);
    }

    return {statusCode: 200, body: JSON.stringify(data)};
};