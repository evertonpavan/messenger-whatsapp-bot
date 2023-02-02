import {
    Button,
    Stack,
    useBoolean,
} from '@chakra-ui/react';
import { IData } from '../../../interfaces/IData';
import { useStep } from '../../../hooks/useStep';
import { IAlertMessageProps } from '../../MessageAlert';
import { useState } from 'react';
import { useSendMessages } from '../../../hooks/useMessages';
import { getDataLocalStorage } from '../../../services/auth';
import { ISendMessagesResponse } from '../../../interfaces/ISendMessagesResponse';

interface IQRCodeResponse {
    qrCode?: string;
    message?: string;
}

interface IStartStepProps {
    data: IData;
    result: ISendMessagesResponse | null;
    onResultChanged: (result: ISendMessagesResponse | null) => void;
}

function StartStep({ data, result, onResultChanged }: IStartStepProps) {

    const [loadingHandleSubmitData, setLoadinghandleSubmitData] = useBoolean()
    const [message, setMessage] = useState<IAlertMessageProps | null>(null);
    const [loadingGenerateQRCode, setLoadingGenerateQRCode] = useBoolean()

    const [qrCode, setQrCode] = useState<IQRCodeResponse | null>(null);

    const sendMessages = useSendMessages()

    const { currentStep, helpers } = useStep();

    const {
        canGoToNextStep,
        goToNextStep,
        setStep,
    } = helpers


    const handleSubmitData = async (event: any) => {

        setLoadinghandleSubmitData.on()

        setLoadingGenerateQRCode.on()

        // setStep(3)
        goToNextStep()

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
                    onResultChanged(dataResponse)
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

    return (
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
        </>
    )
}

export { StartStep };