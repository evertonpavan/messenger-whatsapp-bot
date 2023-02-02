import {
    Flex,
    FormControl,
    FormLabel,
    Input,
    Button,
    FormHelperText,
    useBoolean,
} from '@chakra-ui/react';
import { useState } from 'react';
import { AlertMessage, IAlertMessageProps } from '../../MessageAlert';
// import { ModalData } from '../../ModalData';
import { IData } from '../../../interfaces/IData';
import { useStep } from '../../../hooks/useStep';

interface IUploadFileStepProps {
    onDataChanged: (data: IData | null) => void;
}

    function UploadFileStep({ onDataChanged }: IUploadFileStepProps) {

    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<IAlertMessageProps | null>(null);
    const [loading, setLoading] = useBoolean();

    const { currentStep, helpers } = useStep();

    const {
      canGoToNextStep,
      goToNextStep,
      setStep,
    } = helpers


    const handleUploadFile = (event: any) => {

        console.log('event.target.files', event.target.files)

        setMessage(null)

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

    const handleCheckFile = async (file: any) => {

        setLoading.on()

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

                    if (!data.contacts || data.contacts.length <= 0) {
                        setMessage({
                            title: 'Error!',
                            message: 'There are no contacts in this file',
                            status: 'info',
                        })

                        return;
                    }

                    if (!data.message || data.message.length <= 0) {
                        setMessage({
                            title: 'Error!',
                            message: 'There is no message in this file',
                            status: 'info',
                        })

                        return;
                    }

                    onDataChanged(data);
                };

                console.log('update step')
                goToNextStep()
                setLoading.off()
                resolve()
            }, 3000);
        });
    }

    console.log('loading', loading)
    console.log('loading', loading)


    return (
        <>
            <form encType="multipart/form">
                <FormControl id="file">
                    <Flex flexDirection="column" gap={'0.5rem'} alignContent={'center'}>
                        <FormLabel m={0}>Choose a file:</FormLabel>
                        <Input
                            type="file"
                            onChange={handleUploadFile}
                            disabled={loading || currentStep > 1 ? true : false}
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
                                disabled={loading || currentStep > 1 ? true : false}
                                as={'span'}
                                width={'100%'}
                            >
                                Upload
                            </Button>
                        </label>

                        {currentStep === 1 && message && (
                            <FormHelperText>
                                <AlertMessage
                                    title={message?.title}
                                    message={message?.message}
                                    status={message?.status || 'info'}
                                    icon={''}
                                />
                            </FormHelperText>
                        )}

                        {/* {file && !loading && (
                            <ModalData
                                label={`file: ${file.name}`}
                                data={data}
                            />
                        )} */}
                    </Flex>
                </FormControl>
            </form>
        </>
    )
}

export { UploadFileStep };