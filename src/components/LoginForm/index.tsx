import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Link,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Icon,
  FormHelperText,
  useBoolean,
  Divider,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Skeleton,
  FormErrorMessage,
  InputRightElement,
  InputGroup,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaWhatsapp } from "react-icons/fa";
import { useCheckAuthentication, useGenerateQRCode, useSendMessages } from '../../hooks/useMessages';
import { AlertMessage, IAlertMessageProps } from '../MessageAlert';
import { CalendarIcon, CheckIcon, CloseIcon, InfoIcon, PhoneIcon, RepeatIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FcPhoneAndroid, FcOk, FcHighPriority, FcRefresh } from "react-icons/fc";
import { SpinnerLoading } from '../SpinnerLoading';
import QRCode from 'react-qr-code';
import { queryClient } from '../../services/ReactQuery/queryClient';
import { ISendMessagesResponse } from '../../interfaces/ISendMessagesResponse';
import { useNavigate } from 'react-router-dom';
import { useLoginAuthentication } from '../../hooks/useAuthentication';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';


// const { VITE_MESSENGER_SERVER_API_URL } = import.meta.env;

function LoginForm() {

 
  let navigate = useNavigate();

  const login = useLoginAuthentication()

  const { isLoading } = login

  const [showPassword, setShowPassword] = useState(false);
  const handlePasswordVisibility = () => setShowPassword(!showPassword);

  // const [message, setMessage] = useState<IAlertBarProps | null>(null);
  const [message, setMessage] = useState<IAlertMessageProps | null>(null);


  const LoginFormSchema = yup.object().shape({
    user: yup.string().required('Obrigatório'),
    password: yup.string().required('Obrigatório'),
  });
  const formOptions = { resolver: yupResolver(LoginFormSchema) };

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting},
    watch
  } = useForm(
    {
      ...formOptions,
      // defaultValues: '',
    }
  );

  const onSubmit = (async (value: any) => {

    const { user, password } = value;

    const response = await login.mutateAsync({
      email: user,
      password
    })

    const { status } = response
  
    if (status === 200) {
     setMessage({
        title: 'Sucesso!',
        message: 'Você será redirecionado para o painel administrativo!',
        status: 'success',
      })

      await new Promise(async (resolve) => {
        setTimeout(() => {
          navigate('/home')
        }, 2000);
      });

      return
    }

    setMessage({
      title: 'Falha!',
      message: 'Usuário ou senha incorretos!',
      status: 'error',
    })
   
    return 
  });



  // const handleSubmitData = async (event: any) => {
  //   setLoadinghandleSubmitData.on()

  //   if (!connected.authenticated) {
  //     console.log('Not connected')
  //     return
  //   }

  //   const response = await sendMessages.mutateAsync({
  //     ...data,
  //   })

  //   const { status } = response

  //   if (status === 200) {
  //     setSentMessage({
  //       title: 'OK!',
  //       message: 'O envio de mensagens foi finalizado!',
  //       status: 'success',
  //     })

  //     console.log('response', response)

  //     return new Promise<void>(async (resolve) => {
  //       setTimeout(() => {
  //         setResultSending(response.data)
  //         setLoadinghandleSubmitData.off()
  //         resolve()
  //         // refetch();
  //       }, 2000);
  //     });
  //   }

  //   setSentMessage({
  //     title: 'OK!',
  //     message: 'O envio de mensagens foi finalizado!',
  //     status: 'success',
  //   })

  //   return new Promise<void>(async (resolve) => {
  //     setTimeout(() => {
  //       setLoadinghandleSubmitData.off()
  //       resolve()
  //       // refetch();
  //     }, 2000);
  //   });
  // }

  return (
    <Flex
      minH={'100vh'}
      // mt={'5rem'}
      // justify={'center'}
      justifyContent={'left'}
      bg={useColorModeValue('gray.50', 'gray.800')}
      gap={'5rem'}
      width={'100%'}
    >

      <Stack spacing={2} mx={'auto'} maxW={'lg'} py={4} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Messenger Bot</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            Envie mensagens em lote pelo <Link color={'#22c35e'}>whatsapp </Link>
            <Icon
              as={FaWhatsapp} color={'#22c35e'}
            />
          </Text>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}
          minH={'80vh'}
        >
          <Stack spacing={8}>
          <form
              onSubmit={handleSubmit(onSubmit)}
            >
              <Stack spacing={4}>
              <FormControl
                  isInvalid={errors.user ? true : false}
                >
                <Flex flexDirection="column" gap={'0.5rem'}>
                  <Input
                    id='user'
                    {...register('user')}
                    placeholder="Usuário"
                    bg={'gray.100'}
                    border={0}
                    color={'gray.500'}
                    _placeholder={{
                      color: 'gray.500',
                    }}
                  />
                   {/* {message && (
                    <FormHelperText>
                      <AlertMessage
                        title={message?.title}
                        message={message?.message}
                        status={message?.status || 'info'}
                        icon={''}
                      />
                    </FormHelperText> */}

                  {errors.user && (
                    <FormErrorMessage
                    >
                      <AlertMessage
                        title={message?.title || ''}
                        message={message?.message ||''}
                        status={message?.status || 'info'}
                        icon={''}
                      />
                    </FormErrorMessage>
                  )}
                </Flex>
                </FormControl>

                <FormControl
                  isInvalid={errors.password ? true : false}
                >
                <InputGroup>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Senha"
                    bg={'gray.100'}
                    border={0}
                    color={'gray.500'}
                    _placeholder={{
                      color: 'gray.500',
                    }}
                  />
                  <InputRightElement width="3rem">
                    <Button h="1.5rem" size="sm" onClick={handlePasswordVisibility}>
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>

                  {errors.password && (
                    <FormErrorMessage
                    >
                      <>*{errors.password.message}</>
                    </FormErrorMessage>
                  )}
                </FormControl>

                {message && (
                  <AlertMessage
                    title={message?.title}
                    message={message?.message}
                    status={message?.status || 'info'} 
                    icon={''}                  
                  />
                )}

              </Stack>
              <Button
                type={'submit'}
                fontFamily={'heading'}
                w={'full'}
                mt={'1rem'}
                colorScheme={'whatsapp'}
                isLoading={isSubmitting}
                loadingText='Autenticando...'
                opacity={isSubmitting ? 0.5 : 1}
                // opacity={isLoading ? 0.5 : 1}
                >
                Entrar
              </Button>

              {/* <FormControl id="email">
                <Flex flexDirection="column" gap={'0.5rem'}>
                  <FormLabel>Selecione o arquivo:</FormLabel>
                  <Input
                    id='user'
                    {...register('user')}
                    placeholder="Usuário"
                    bg={'gray.100'}
                    border={0}
                    color={'gray.500'}
                    _placeholder={{
                      color: 'gray.500',
                    }}
                    />
                  {message && (
                    <FormHelperText>
                      <AlertMessage
                        title={message?.title}
                        message={message?.message}
                        status={message?.status || 'info'}
                        icon={''}
                      />
                    </FormHelperText>
                  )}

                </Flex>
              </FormControl> */}
            </form>
            <Divider />
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}

export { LoginForm };