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
  Progress,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaWhatsapp } from "react-icons/fa";
import { useSendMessages } from '../../hooks/useMessages';
import { AlertMessage, IAlertMessageProps } from '../MessageAlert';
import { RepeatIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FcPhoneAndroid, FcOk, FcHighPriority } from "react-icons/fc";
import QRCode from 'react-qr-code';
import { ISendMessagesResponse } from '../../interfaces/ISendMessagesResponse';
import { VscGithubInverted } from "react-icons/vsc";
import { useLoginAuthentication } from '../../hooks/useAuthentication';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { FiLogOut } from 'react-icons/fi';
import socketIO from 'socket.io-client';
import { ModalData } from '../ModalData';
import { GoMarkGithub, GoHeart} from "react-icons/go";

const { VITE_MESSENGER_SERVER_SOCKET_URL } = import.meta.env;

// const { VITE_MESSENGER_SERVER_API_URL } = import.meta.env;

function Form() {
  // let navigate = useNavigate();

  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  useEffect(() => {
    const socket = socketIO(VITE_MESSENGER_SERVER_SOCKET_URL!);
    socket.on('connect', () => {
      console.log('Connected to socket server');
      setSocketConnected(true);
      // socket.emit('request_orders');
    });

    socket.on('qrCode', (data) => {
      console.log('updating', data)
      const { qrCode } = data;
      setQrCode(qrCode)
      setLoadingGenerateQRCode.off()
    })

    socket.on('connectionStatus', (data) => {
      console.log('updating', data)
      const { connectionStatus } = data;
      setConnectionStatus(connectionStatus)

      connectionStatus ? setStep(4) : null;
    })

    socket.on('disconnect', () => {
      console.error('Ops, something went wrong');
    });
  }, [])

  interface IQRCodeResponse {
    qrCode?: string;
    message?: string;
  }

  const [qrCode, setQrCode] = useState<IQRCodeResponse | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);

  const [step, setStep] = useState(1);

  const { user, authenticated, onSignoutSuccess } = useAuth();

  const login = useLoginAuthentication()

  // const { isLoading: isLoadingLogin } = login

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
    setFile(null);
    setData(null);
    setStep(1);
  }

  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<IAlertMessageProps | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useBoolean()
  const [loadingHandleSubmitData, setLoadinghandleSubmitData] = useBoolean()
  const [loadingGenerateQRCode, setLoadingGenerateQRCode] = useBoolean()


  const [result, setResult] = useState<ISendMessagesResponse | null>(null);

  const sendMessages = useSendMessages()

  // const { isLoading } = sendMessages; // remove? testing

  // const { isOpen, onOpen, onClose } = useDisclosure()

  const handleUploadFile = (event: any) => {

    setMessage(null)
    setData(null)

    const { type, name } = event.target.files[0];

    if (type !== 'application/json' || !name.endsWith('.json')) {
      setMessage({
        title: 'Error!',
        message: 'Invalid file format',
        status: 'error',
      })

      return;
    }

    var uploadFile: File;

    if (event.target.files) {
      setFile(event.target.files[0]);
      uploadFile = event.target.files[0]


      handleCheckFile(uploadFile)

    }

  };

  // const handleCheckFile = async (event: any) => {
  const handleCheckFile = async (file: any) => {

    setLoading.on()

    // event.preventDefault()

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

        setStep(2)
        setLoading.off()
        resolve()
      }, 3000);
    });
  }

  const handleSubmitData = async (event: any) => {

    setLoadinghandleSubmitData.on()

    setLoadingGenerateQRCode.on()

    setStep(3)

    const response = await sendMessages.mutateAsync({
      ...data,
    })

    const { status, data: dataResponse } = response

    if (status === 200) {
      setMessage({
        title: 'Done!',
        message: 'Sending messages has ended!',
        status: 'success',
      })

      return new Promise<void>(async (resolve) => {
        setTimeout(() => {
          setLoadinghandleSubmitData.off()
          setResult(dataResponse)
          setStep(5)
          resolve()
          // refetch();
        }, 2000);
      });
    }


    return new Promise<void>(async (resolve) => {
      setTimeout(() => {
        setLoadinghandleSubmitData.off();
        setLoadingGenerateQRCode.off();
        resolve();
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

  console.log('step', step);
  console.log('qrCode', qrCode);
  console.log('loadingGenerateQRCode', loadingGenerateQRCode);


  return (
    <Flex
      minH={'100vh'}
      justifyContent={'left'}
      bg={useColorModeValue('gray.50', 'gray.800')}
      gap={'5rem'}
      width={'100%'}
    >

      <Stack spacing={2} mx={'auto'} maxW={'lg'} py={4} px={6} minWidth={'22.5rem'}>
        <Stack align={'center'}>
          <Flex
            width={'100%'}
            direction={'row'}
            justifyContent={'right'}
            // alignContent={''}
            align={'center'}
            mb={'1rem'}
            gap={'2rem'}
          >
             <Link href='https://github.com/sponsors/evertonpavan' isExternal
             >
              <Button
                type={'button'}
                // leftIcon={<Icon as={GoHeart} boxSize={6} color={'pink.500'} />}
                leftIcon={
                  <Icon viewBox='0 0 16 16' color='#db61a2'>
                    <path
                      fill='currentColor'
                      d='M4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.565 20.565 0 008 13.393a20.561 20.561 0 003.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.75.75 0 01-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5zM8 14.25l-.345.666-.002-.001-.006-.003-.018-.01a7.643 7.643 0 01-.31-.17 22.075 22.075 0 01-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.08 22.08 0 01-3.744 2.584l-.018.01-.006.003h-.002L8 14.25zm0 0l.345.666a.752.752 0 01-.69 0L8 14.25z'
                    />
                  </Icon>
                }
                variant={'outline'}
                colorScheme={'gray'}
              >
                Sponsor
              </Button>
            </Link>
            <Link href='https://chakra-ui.com' isExternal 
            >
              <Icon as={GoMarkGithub} boxSize={6} 
              
              />
            </Link>
          </Flex>
          <Heading fontSize={'3xl'}>JSON to Whatsapp Web</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            send a bunch of messages on
            <Link 
            color={socketConnected ? '#22c35e' : 'gray'}
            >
              {' '} whatsapp {' '}
            </Link>
            <Icon
              as={FaWhatsapp} 
              color={socketConnected ? '#22c35e' : 'gray'}
            />
          </Text>
        </Stack>
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
              <>
               <Flex
                  direction={'column'}
                  textAlign={'left'}
                  w={'100%'}
                >
                <Flex
                  direction={'row'}
                  alignItems={'center'}
                  justify={'center'}
                  // boxShadow={'md'}
                  margin={'0 0 2rem 0'}
                  gap={'2rem'}
                  w={'100%'}
                >
                  <Text fontSize=''>Welcome, <strong>{user.name}</strong>!</Text>
                  <Button
                    type={'button'}
                    leftIcon={<FiLogOut />}
                    variant={'ghost'}
                    colorScheme={'blackAlpha'}
                    onClick={() => handleLogout()}
                  >
                  </Button>
                </Flex>
                <Stack w={'auto'} m={'0'} p={0}>
                  <Text>Follow the three simple steps below:</Text>
                    <UnorderedList pl={'1.2rem'}>
                      <ListItem>Upload a JSON file</ListItem>
                      <ListItem>Click on START</ListItem>
                      <ListItem>Scan the QR Code</ListItem>
                    </UnorderedList>
                  <Text>After that, just wait, the messages will be sent automatically.</Text>
                </Stack>
                </Flex>
              </>
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
                  <Flex flexDirection="column" gap={'0.5rem'} alignContent={'center'}>
                    <FormLabel m={0}>Choose a file:</FormLabel>
                    <Input
                      type="file"
                      onChange={handleUploadFile}
                      disabled={loading || step > 1 ? true : false}
                      style={{ display: 'none' }}
                      id="contained-button-file"
                    />
                    <label htmlFor="contained-button-file">
                      <Button
                        mt={'1rem'}
                        type={'button'}
                        colorScheme={'whatsapp'}
                        isLoading={loading}
                        loadingText={'Checking data file...'}
                        opacity={loading ? 0.5 : 1}
                        disabled={loading || step > 1 ? true : false}
                        as={'span'}
                        width={'100%'}
                      >
                        Upload
                      </Button>
                    </label>

                    {step === 1 && message && (
                      <FormHelperText>
                        <AlertMessage
                          title={message?.title}
                          message={message?.message}
                          status={message?.status || 'info'}
                          icon={''}
                        />
                      </FormHelperText>
                    )}

                    {file && !loading && (
                        <ModalData
                          label={`file: ${file.name}`}
                          data={data}
                        />
                    )}

                   

                  </Flex>
                </FormControl>

                {/* <Stack spacing={10}>
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
                </Stack> */}
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
                      {result ? 'Done' : 'Start'} 
                    </Button>
                  </Stack>

                  <Divider />
                </>
             )}


              {data && step >= 3 && (
                <>
                  <Stack spacing={4} textAlign={'left'} gap={6}>
                    <>
                      <Text fontSize={'md'}>
                        Scan QR Code:
                      </Text>

                      {/* {qrCode ? ( */}
                      {loadingGenerateQRCode ? (
                        <Box
                          style={{ height: "auto", margin: "0 auto", maxWidth: 300, width: "100%" }}
                        >
                          <Skeleton startColor='gray.500' endColor='gray.800' width='300px' height='300' />
                        </Box>
                      ) : (
                        <>
                          {qrCode && qrCode.qrCode ? (
                          <Flex
                            style={{ height: "auto", margin: "0 auto", maxWidth: 300, width: "100%" }}
                          >
                            <QRCode
                              size={256}
                              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                              viewBox={`0 0 256 256`}
                              value={qrCode?.qrCode || ''}
                            />
                          </Flex>
                         ) : ( 
                           <Flex
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
                                {qrCode?.message}
                              </Text>
                              <Text>
                                Try again
                              </Text>
                              <RepeatIcon boxSize={10} color={'whatsapp.500'} />
                            </Flex> 
                            )}    
                        </>
                      )}
                    </>
                  </Stack>

                  <Text fontSize={'md'}>
                    Status: {connectionStatus ? 'Connected' : 'Disconnected'}
                  </Text>

                  <Divider />
                </>
              )}

              {connectionStatus && step >= 4 && (
                <>
                  <Stack spacing={4}>
                    <Flex flexDirection="row" gap={'0.5rem'} justifyContent={'flex-end'}>
                      <Flex flexDirection="column" textAlign={'right'} w={'100%'}>
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
                        {result && (
                          <>
                            <p>{result.messagesTotal}</p>
                            <p>{result.messagesSent}</p>
                            <p>{result.messagesFailed}</p>
                          </>
                        )}
                      </Flex>
                    </Flex>
                    {step === 4 && (
                      <Progress hasStripe isIndeterminate={result ? false : true} size='sm' colorScheme={'whatsapp'} />
                    )}

                    {step >= 5 && result && message && (
                          <AlertMessage
                            title={message?.title}
                            message={message?.message}
                            status={message?.status || 'info'}
                            icon={''}
                          />
                    )}
                  </Stack>
                </>
              )}

              {step === 5 && (
              <Stack spacing={10}>
                <Button
                  type={'submit'}
                  colorScheme={'blackAlpha'}
                  onClick={() => {
                    setFile(null);
                    setData(null);
                    setStep(1);
                    setMessage(null)
                  }}
                //  disabled={!qrCode ? false : true}
                //  isLoading={loadingHandleSubmitData}
                //  loadingText={'Starting...'}
                >
                  Upload another file
                </Button>
              </Stack>
              )} 
            </Stack>
          ) : (
            <></>
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