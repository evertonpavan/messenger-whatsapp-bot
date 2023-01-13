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
  Center,
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
import { useAuth } from '../../hooks/useAuth';
import { FiLogOut } from 'react-icons/fi';
import socketIO from 'socket.io-client';

const { VITE_MESSENGER_SERVER_SOCKET_URL } = import.meta.env;

// const { VITE_MESSENGER_SERVER_API_URL } = import.meta.env;

function Form() {
  // let navigate = useNavigate();

  useEffect(() => {
    const socket = socketIO(VITE_MESSENGER_SERVER_SOCKET_URL!);
    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('request_orders');
    });

    socket.on('qrCode', (data) => {
      console.log('updating', data)
      const { qrCode } = data;
      setQrCode(qrCode)
    })

    socket.on('connectionStatus', (data) => {
      console.log('updating', data)
      const { connectionStatus } = data;
      setConnectionStatus(connectionStatus)
    })

    socket.on('disconnect', () => {
      console.error('Ops, something went wrong');
    });
  }, [])

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);


  const [step, setStep] = useState(1);

  const { user, authenticated, onSignoutSuccess } = useAuth();
  // console.log({ user })

  const login = useLoginAuthentication()

  const { isLoading: isLoadingLogin } = login

  const [showPassword, setShowPassword] = useState(false);
  const handlePasswordVisibility = () => setShowPassword(!showPassword);

  const onSubmit = (async (value: any) => {

    setMessage(null);

    const { user: email, password } = value;

    const response = await login.mutateAsync({
      email: email,
      password
    })

    const { status } = response

    if (status === 200) {

      await new Promise(async (resolve) => {
        setTimeout(() => {
          resolve(true)
        }, 2000);
      });

      return
    }

    setMessage({
      title: 'Failure!',
      message: 'Username or password incorrect!',
      status: 'error',
    })

    return
  });

  function handleLogout() {
    onSignoutSuccess();
  }


  const [file, setFile] = useState<File>();

  const [message, setMessage] = useState<IAlertMessageProps | null>(null);
  const [successMessage, setSuccessMessage] = useState<IAlertMessageProps | null>(null);
  const [sentMessage, setSentMessage] = useState<IAlertMessageProps | null>(null);

  const [data, setData] = useState<any>();
  const [loading, setLoading] = useBoolean()
  const [loadingHandleSubmitData, setLoadinghandleSubmitData] = useBoolean()
  const [loadingHandleCheckConnectionWhatsapp, setLoadingHandleCheckConnectionWhatsapp] = useBoolean()

  const [resultSending, setResultSending] = useState<ISendMessagesResponse | null>(null);


  const sendMessages = useSendMessages()

  // useEffect(() => {
  //   if (connected?.authenticated) {
  //     setStep(3)
  //   }
  // }, [connected]);

  const { isLoading } = sendMessages; // remove? testing

  const handleUploadFile = (event: any) => {

    setMessage(null)
    setSuccessMessage(null)
    setData(null)

    const { type, name } = event.target.files[0];

    if (type !== 'application/json' || !name.endsWith('.json')) {
      setMessage({
        title: 'Erro!',
        message: 'Formato do arquivo inválido',
        status: 'error',
      })

      return;
    }

    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleCheckFile = async (event: any) => {

    setLoading.on()

    event.preventDefault()

    if (!file) {
      return;
    }

    return new Promise<void>(async (resolve) => {
      setTimeout(() => {

        const fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = e => {
          const result = e?.target?.result!
          const data = JSON.parse(String(result));

          if (!data.contatos || data.contatos.length <= 0) {
            setMessage({
              title: 'Error!',
              message: 'There are no contacts in this file',
              status: 'info',
            })

            return;
          }

          if (!data.mensagem || data.mensagem.length <= 0) {
            setMessage({
              title: 'Error!',
              message: 'There is no message in this file',
              status: 'info',
            })

            return;
          }

          // var mensagem = data.mensagem.replace(/\r\n/gi, '%0D%0A');

          setData({ ...data, mensagem: data.mensagem })
        };

        setSuccessMessage({
          title: '',
          message: 'Arquivo verficado com sucesso!',
          status: 'success',
        })

        setStep(2)

        setLoading.off()
        resolve()
      }, 3000);
    });
  };


  const handleSubmitData = async (event: any) => {
    setLoadinghandleSubmitData.on()

    // if (!connected.authenticated) {
    //   // console.log('Not connected')
    //   return
    // }

    const response = await sendMessages.mutateAsync({
      ...data,
    })

    const { status } = response

    if (status === 200) {
      setSentMessage({
        title: 'OK!',
        message: 'Sending messages has ended!',
        status: 'success',
      })

      return new Promise<void>(async (resolve) => {
        setTimeout(() => {
          setLoadinghandleSubmitData.off()
          setStep(3)
          resolve()
          // refetch();
        }, 2000);
      });
    }

    // setSentMessage({
    //   title: 'OK!',
    //   message: 'Sending messages has ended!',
    //   status: 'success',
    // })

    return new Promise<void>(async (resolve) => {
      setTimeout(() => {
        setLoadinghandleSubmitData.off()
        resolve()
        // refetch();
      }, 2000);
    });
  }

  const LoginFormSchema = yup.object().shape({
    user: yup.string().required('Obrigatório'),
    password: yup.string().required('Obrigatório'),
  });

  const formOptions = { resolver: yupResolver(LoginFormSchema) };

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    watch
  } = useForm(
    {
      ...formOptions,
      // defaultValues: '',
    }
  );

  console.log('step', step)
  console.log('qrCode', qrCode)


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

      <Stack spacing={2} mx={'auto'} maxW={'lg'} py={4} px={6} minWidth={'22.5rem'}>
        <Stack align={'center'}>
          <Heading fontSize={'3xl'}>Messenger Whatsapp Bot</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            send a bunch of messages on <Link color={'#22c35e'}>whatsapp </Link>
            <Icon
              as={FaWhatsapp} color={'#22c35e'}
            />
          </Text>
        </Stack>
        {/* <Box */}
        <Stack spacing={8}
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}
          minH={'80vh'}
        >
          {/* login */}
          <Center
            minHeight={'200px'}
          >

            {user && authenticated ? (
              <Flex
                direction={'row'}
                alignItems={'center'}
                justify={'center'}
                // boxShadow={'md'}
                margin={'0 0 2rem 0'}
                gap={'2rem'}
                w={'100%'}
              >
                <Text>Welcome, {user.name}!</Text>
                <Button
                  type={'button'}
                  leftIcon={<FiLogOut />}
                  variant={'ghost'}
                  colorScheme={'blackAlpha'}
                  onClick={() => handleLogout()}
                >

                </Button>

              </Flex>
            ) : (
              <Stack spacing={8} minWidth={'22.5rem'}>
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
                            <>*{errors.user.message}</>
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
                  // opacity={isLoadingLogin ? 0.5 : 1}
                  >
                    Login
                  </Button>
                </form>
              </Stack>
            )}
          </Center>

          <Divider />

          {user && authenticated ? (
            <Stack spacing={8} minWidth={'22.5rem'}>
              <form encType="multipart/form">
                <FormControl id="file">
                  <Flex flexDirection="column" gap={'0.5rem'}>
                    <FormLabel>Choose a file:</FormLabel>
                    <Input
                      type="file"
                      onChange={handleUploadFile}
                      disabled={loading || step > 1 ? true : false}
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
                </FormControl>

                <Stack spacing={10}>
                  <Button
                    mt={'1rem'}
                    type={'submit'}
                    colorScheme={'whatsapp'}
                    onClick={handleCheckFile}
                    disabled={file && step < 2 ? false : true}
                    isLoading={loading}
                    loadingText={'Checking data file...'}
                    opacity={loading ? 0.5 : 1}
                  >
                    Check data file
                  </Button>
                </Stack>
              </form>

              <Divider />

              {data && step >= 2 && (
                <>
                  <Stack spacing={10}>
                    <Button
                      type={'submit'}
                      colorScheme={'green'}
                      onClick={handleSubmitData}
                      disabled={!qrCode ? false : true}
                      isLoading={loadingHandleSubmitData}
                      loadingText={'Starting...'}
                      opacity={loadingHandleSubmitData ? 0.5 : 1}
                    >
                      Start
                    </Button>
                  </Stack>

                  <Divider />
                </>
              )}


              {data && step >= 2 && (
                <>
                  <Stack spacing={4} textAlign={'left'} gap={6}>
                    <>
                      <Text fontSize={'md'}>
                        Scan QR Code:
                      </Text>


                      {!qrCode ? (
                        <Box
                          style={{ height: "auto", margin: "0 auto", maxWidth: 300, width: "100%" }}
                        >
                          <Skeleton startColor='gray.500' endColor='gray.800' width='300px' height='300' />
                        </Box>
                      ) : (
                        <>
                          {/* {qrCode ? ( */}
                            <Flex
                              style={{ height: "auto", margin: "0 auto", maxWidth: 300, width: "100%" }}
                            >
                              <QRCode
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                                value={qrCode}
                              />
                            </Flex>
                          {/* ) : ( */}
                            {/* <Flex
                              style={{ height: "300px", margin: "0 auto", maxWidth: 300, width: "100%" }}
                              // bg={'red.100'}
                              boxShadow={'lg'}
                              textAlign={'center'}
                              // color={'white'}
                              justifyContent={'center'}
                              align={'center'}
                              direction={'column'}
                              gap={'1rem'}
                              as={'button'}
                            // onClick={() => refetchGenerateQRCode()}
                            >
                              <Text color={'red.500'}>
                                {qrCode}
                              </Text>
                              <Text>
                                Try again
                              </Text>
                              <RepeatIcon boxSize={10} color={'whatsapp.500'} />
                            </Flex> */}
                          {/* )} */}

                        </>
                      )}
                    </>
                  </Stack>
                </>

             

              )}

              <Text fontSize={'md'}>
                  Status: {connectionStatus ? 'Connected' : 'Disconnected'}
              </Text> 

              <Divider />


              {/* {connectionStatus  && ( */}
                <>
                <Stack spacing={4}>
                  {resultSending && (
                    <Flex flexDirection="row" gap={'0.5rem'} justifyContent={'flex-end'}>
                      <Flex flexDirection="column" textAlign={'right'} >
                        <p>
                          <Icon
                            as={FcPhoneAndroid}
                          /> {'  '}
                          Total contacts:
                        </p>

                        <p>
                          <Icon
                            as={FcOk} color={'#22c35e'}
                          /> {'  '}
                          Messages sent successfully:
                        </p>
                        <p>
                          <Icon
                            as={FcHighPriority}
                          /> {'  '}
                          Unsent messages:
                        </p>
                      </Flex>

                      <Flex flexDirection="column" textAlign={'right'}>
                        <>
                          <p>{resultSending.messagesTotal}</p>
                          <p>{resultSending.messagesSent}</p>
                          <p>{resultSending.messagesFailed}</p>
                        </>
                      </Flex>
                    </Flex>
                  )}
                </Stack>
              </>
              {/* )} */}




              {/*  */}


            </Stack>
          ) : (
            <p>not authenticated</p>
          )}


        </Stack>
      </Stack>

      {/* {data && file ? (

        <Stack spacing={2} maxW={'lg'} py={12} px={6}>
          <Flex>
            <Text fontSize={'sm'} color={'gray.600'}>
              Dados do arquivo: {file.name}
            </Text>
          </Flex>

          <TableContainer
            boxShadow={'md'}
            whiteSpace={'break-spaces'}
            minWidth={'100vh'}
            p={'1rem 0'}
            borderRadius={'1rem'}
            minHeight={'80vh'}
            width={'100%'}
          >
            <Table variant='simple' size={'sm'}>
              <Thead
                bg={'#385898'}
              >
                <Tr key={99999}>
                  <Th color={'white'} w={'30%'}>E-mail</Th>
                  <Th color={'white'} w={'30%'}>Nome</Th>
                  <Th color={'white'} w={'30%'}>Telefone</Th>
                  <Th color={'white'} w={'10%'} isNumeric>Status</Th>
                </Tr>
              </Thead>
              <Tbody  bg={'white'} >
                { data.contatos && data.contatos.map((contact: any, index: number) => (
                  <Tr key={index}>
                      {contact && contact.map((index: string) => (
                        <Td key={index}>{index}</Td>
                      ))}
                      <Td isNumeric>-</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Stack>
      ) : (
        <>
          <span></span>
        </>
      )} */}
    </Flex>
  );
}

export { Form };