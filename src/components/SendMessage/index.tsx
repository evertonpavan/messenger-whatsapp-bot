import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Text,
  Icon,
  FormHelperText,
  useBoolean,
  Divider,
  Skeleton,
  Center,
  Progress,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useSendMessages } from '../../hooks/useMessages';
import { AlertMessage, IAlertMessageProps } from '../MessageAlert';
import { RepeatIcon } from '@chakra-ui/icons';
import { FcPhoneAndroid, FcOk, FcHighPriority } from "react-icons/fc";
import QRCode from 'react-qr-code';
import { ISendMessagesResponse } from '../../interfaces/ISendMessagesResponse';
import { useLoginAuthentication } from '../../hooks/useAuthentication';
import { useAuth } from '../../hooks/useAuth';
import { FiLogOut } from 'react-icons/fi';
import socketIO from 'socket.io-client';
import { ModalData } from '../ModalData';
import { getDataLocalStorage, setDataLocalStorage } from '../../services/auth';
import { Layout } from '../../pages/Layout';
import { UploadFileStep } from './Steps/UploadFileStep';
import { IData } from '../../interfaces/IData';
import { useStep } from '../../hooks/useStep';
import { useUserProfile } from '../../hooks/useUser';
import { SpinnerLoading } from '../SpinnerLoading';
import { SocketAddress } from 'net';
import { StartStep } from './Steps/Start';
import { QRCodeStep } from './Steps/QRCodeStep';

const { VITE_MESSENGER_SERVER_SOCKET_URL } = import.meta.env;

interface IQRCodeResponse {
  qrCode?: string;
  message?: string;
}

interface IConnectionStatusResponse {
  status: boolean;
  message?: string;
}

function SendMessage() {

  const [qrCode, setQrCode] = useState<IQRCodeResponse | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<IConnectionStatusResponse>({ status: false });

  const { currentStep, helpers } = useStep()

  const {
    canGoToPrevStep,
    canGoToNextStep,
    goToNextStep,
    goToPrevStep,
    reset,
    setStep,
  } = helpers

  const { user, setUser, authenticated, onSignoutSuccess, token, socketConnected, setSocketConnected } = useAuth();

  const login = useLoginAuthentication()

  function handleLogout() {
    onSignoutSuccess();
    setFile(null);
    setData(null);
    setStep(1);
  }

  useEffect(() => {

    if (!authenticated) return;

    const socket = socketIO(VITE_MESSENGER_SERVER_SOCKET_URL!, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('conected:', socket.id)

      setDataLocalStorage('sessionId', socket.id)
      setSessionId(socket.id)
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
      console.log('connectionStatus updating', data)
      const { connectionStatus } = data;
      setConnectionStatus(connectionStatus)

      connectionStatus.status ? setStep(4) : null;
    })


    socket.on('disconnect', () => {
      console.error('Ops, something went wrong');
    });
  }, [authenticated])

  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<IAlertMessageProps | null>(null);
  const [data, setData] = useState<IData | null>(null);
  const [loadingHandleSubmitData, setLoadinghandleSubmitData] = useBoolean()
  const [loadingGenerateQRCode, setLoadingGenerateQRCode] = useBoolean()

  const [sessionId, setSessionId] = useState<null | string>(null);

  const [result, setResult] = useState<ISendMessagesResponse | null>(null);

  const sendMessages = useSendMessages()

  const handleSubmitData = async (event: any) => {

    setLoadinghandleSubmitData.on()

    setLoadingGenerateQRCode.on()

    setStep(3)

    const response = await sendMessages.mutateAsync({
      ...data,
      sessionId: getDataLocalStorage('sessionId')
    })

    console.log('response', response)

    const { status, data: dataResponse, message } = response

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

    setMessage({
      title: 'Failure!',
      message: message,
      status: 'error',
    })


    return new Promise<void>(async (resolve) => {
      setTimeout(() => {
        setLoadinghandleSubmitData.off();
        setLoadingGenerateQRCode.off();
        resolve();
        // refetch();
      }, 2000);
    });
  }

  const { data: dataUserProfile, isFetching, isLoading} = useUserProfile(user);

  if (isFetching || isLoading) {
    return (
      <>
        <SpinnerLoading />
      </>
    )
  }

  if (dataUserProfile) {
    setUser(dataUserProfile)
  }

  console.log({
    currentStep,
    file,
    data,
    message,
    qrCode,
    connectionStatus,
    sessionId,
    socketConnected
  })

  return (
    <>
      <Layout>
        <Center
          minHeight={'200px'}
        >
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
                  <Text fontSize=''>Welcome, <strong>{user?.name}</strong>!</Text>
                  <Button
                    type={'button'}
                    leftIcon={<FiLogOut />}
                    variant={'ghost'}
                    colorScheme={'blackAlpha'}
                    onClick={() => handleLogout()}
                  >
                  </Button>
                </Flex>
                <Stack>
                  <Text>Follow the three simple steps below:</Text>
                  <UnorderedList pl={'1.2rem'}>
                    <ListItem>Upload a JSON file</ListItem>
                    <ListItem>Click on START</ListItem>
                    <ListItem>Scan the QR Code</ListItem>
                  </UnorderedList>
                  <Text>After that, just wait, the messages will be sent automatically. 🤩</Text>
                </Stack>
              </Flex>
            </>
        </Center>

        <Divider />

          <Stack spacing={8} minWidth={'22.5rem'}>
           
            <UploadFileStep 
              onDataChanged={setData}
            />

            <Divider />

            {data && currentStep >= 2 && (
              <>

              <StartStep
                data={data}
                result={result}
                onResultChanged={setResult}
              />

              <Divider />
            </>
            )}

            {data && currentStep >= 3 && (
              <>
              <QRCodeStep 
                qrCode={qrCode}
                connectionStatus={connectionStatus}
              />
                {/* <Stack spacing={4} textAlign={'left'} gap={6}>
                  <>
                    <Text fontSize={'md'}>
                      Scan QR Code:
                    </Text>

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
                              {currentStep === 3 && message?.message ? message?.message : qrCode?.message}
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
                </Stack> */}

                {/* <Text fontSize={'md'}>
                  Status: {connectionStatus.status ? 'Connected' : 'Disconnected'}
                </Text> */}

                <Divider />
              </>
            )}

            {connectionStatus.status && currentStep >= 4 && (
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
                  {currentStep === 4 && (
                    <Progress hasStripe isIndeterminate={result ? false : true} size='sm' colorScheme={'whatsapp'} />
                  )}

                  {currentStep >= 5 && result && message && (
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

            {currentStep === 5 && (
              <Stack spacing={10}>
                <Button
                  type={'submit'}
                  colorScheme={'blackAlpha'}
                  onClick={() => {
                    setFile(null);
                    setData(null);
                    setStep(1);
                    setMessage(null)
                    setQrCode(null)
                    setConnectionStatus({ status: false })
                    window.location.reload();
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
      </Layout >
    </>
  );
}

export { SendMessage };