import axios from "axios";

const { VITE_MESSENGER_SERVER_API_URL } = import.meta.env;

export function setupMessengerServerAPIClient(): any {

    const messengerServerAPI = axios.create({
        baseURL: `${VITE_MESSENGER_SERVER_API_URL}`,
        // baseURL: `http://localhost:8302`, //dev
        // withCredentials: true
        // timeout: 10000,
    });

    return messengerServerAPI;
}
