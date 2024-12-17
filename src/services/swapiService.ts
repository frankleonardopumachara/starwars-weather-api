import axios from 'axios';

export const fetchStarWarsData = async (planetId: number) => {
    const response = await axios.get(`https://swapi.dev/api/planets/${planetId}/`);
    return response.data;
};