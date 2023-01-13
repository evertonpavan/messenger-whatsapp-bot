import { useMutation, useQuery } from 'react-query';
import { IAuthenticationRequest } from '../interfaces/IAuth';
import { authentication } from '../services/MessengerServerAPI/functions';
// import { queryClient } from '../services/ReactQuery/queryClient';
import { useAuth } from './useAuth';

// 1 hora = 3600000 ms
// const staleTime = 3600000

export const useLoginAuthentication = () => {

  const { onLoginSuccess } = useAuth();

  return useMutation(async (credentials: IAuthenticationRequest) => {

    const response = await authentication(credentials)

    return response
  }, {
    onSuccess: (data) => {

      onLoginSuccess(data)

      return data
    }
  })
}