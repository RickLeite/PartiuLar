import axios from 'axios';
import https from 'https';

const api = axios.create({
    timeout: 5000,
    httpsAgent: new https.Agent({
        rejectUnauthorized: true,
        timeout: 5000
    }),
    headers: {
        'User-Agent': 'PartiuLar/1.0',
        'Accept': 'application/json'
    }
});

/**
 * Tenta obter coordenadas do OpenStreetMap
 */
const tryOpenStreetMap = async (formattedCEP) => {
    try {
        const baseUrl = 'https://nominatim.openstreetmap.org';
        const searchParams = {
            format: 'json',
            q: `${formattedCEP},Brazil`,
            limit: 1
        };

        // Construa a URL completa para logging
        const urlWithParams = `${baseUrl}/search?` + new URLSearchParams(searchParams).toString();
        console.log('Tentando requisição para URL:', urlWithParams);

        const response = await api.get(`${baseUrl}/search`, {
            params: searchParams
        });

        // Log debug
        console.log('Resposta completa do OpenStreetMap:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.length > 0) {
            const result = {
                latitude: parseFloat(response.data[0].lat),
                longitude: parseFloat(response.data[0].lon)
            };
            console.log('Coordenadas extraídas:', result);
            return result;
        }

        console.log('Nenhum resultado encontrado na resposta');
        return null;
    } catch (error) {
        console.error('Erro detalhado no OpenStreetMap:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });
        return null;
    }
};

/**
 * Converte um CEP brasileiro em coordenadas geográficas
 * @param {string} cep - CEP no formato XXXXX-XXX ou XXXXXXXX
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCoordinatesFromCEP = async (cep) => {
    try {
        console.log('Iniciando busca de coordenadas para CEP:', cep);

        // Limpa o CEP
        const cleanCEP = cep.replace(/\D/g, '');
        console.log('CEP limpo:', cleanCEP);

        if (cleanCEP.length !== 8) {
            console.warn(`CEP inválido (comprimento incorreto): ${cep}`);
            return getFallbackCoordinates();
        }

        // Formata o CEP
        const formattedCEP = `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`;
        console.log('CEP formatado:', formattedCEP);

        // Tenta o OpenStreetMap
        const coordinates = await tryOpenStreetMap(formattedCEP);

        if (coordinates && isValidCoordinate(coordinates.latitude, coordinates.longitude)) {
            console.log('Coordenadas válidas encontradas:', coordinates);
            return coordinates;
        }

        console.warn(`Coordenadas não encontradas ou inválidas para o CEP ${formattedCEP}`);
        return getFallbackCoordinates();
    } catch (error) {
        console.error('Erro geral ao buscar coordenadas:', error);
        return getFallbackCoordinates();
    }
};

/**
 * Verifica se as coordenadas são válidas
 */
const isValidCoordinate = (lat, lon) => {
    const isValid = !isNaN(lat) &&
        !isNaN(lon) &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180;

    console.log('Validação de coordenadas:', {
        latitude: lat,
        longitude: lon,
        isValid: isValid
    });

    return isValid;
};

/**
 * Retorna coordenadas de fallback baseadas na cidade/estado
 */
const getFallbackCoordinates = () => {
    const fallback = {
        latitude: -22.907104,
        longitude: -47.063240
    };
    console.log('Usando coordenadas de fallback:', fallback);
    return fallback;
};