import { IAuthenticationRequest } from '../../interfaces/IAuth';
import { messengerServerAPI } from './apiClient'

type TError = {
    message: string;
    response: any
}

interface ISendMessagesRequest {
    unidade: string;
    mensagem: string;
    contatos: string;
}

export async function sendMessages(data: ISendMessagesRequest): Promise<any> {
    try {

        const response = await messengerServerAPI.post(`/send-messages`, {
            ...data
        },);

        const result = { data: response.data, status: response.status }


        return result;
    } catch (error) {
        const reponseError = error as TError;
        // console.log('error', error)
        return {
            message: reponseError.response.data.message,
            status: reponseError.response.status
        }
    }
}

export async function generateQRCode(): Promise<any> {
    try {

        const response = await messengerServerAPI.get(`/qr-code`);

        const result = { data: response.data, status: response.status }

        console.log('result', result)
        return result;
    } catch (error) {
        const reponseError = error as TError;
        console.log('error', error)
        return {
            message: reponseError.response.data.message,
            status: reponseError.response.status
        }
    }
}

export async function checkAuthentication(): Promise<any> {
    try {

        const response = await messengerServerAPI.get(`/check-authentication`);

        const result = { data: response.data, status: response.status }


        return result;
    } catch (error) {
        const reponseError = error as TError;
        // console.log('error', error)
        return {
            message: reponseError.response.data.message,
            status: reponseError.response.status
        }
    }
}

export async function authentication({ email, password }: IAuthenticationRequest): Promise<any> {
    try {

        const response = await messengerServerAPI.post(`/auth/login`, {
            email,
            password
        });

        const data = { ...response.data, status: response.status };

        return data;
    } catch (error) {
        console.log('error authentication', error)
        return {
            message: "Serviço indisponível",
        } as TError;
        // const reponseError = error as TError;
        // return {
        //     message: reponseError.response.data.message,
        //     status: reponseError.response.status
        // }
    }
}
