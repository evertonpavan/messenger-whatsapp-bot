import { EmailIcon } from "@chakra-ui/icons";
import { Button, Flex, Heading, IconButton, Image } from "@chakra-ui/react";
import { ArrowLeft } from "phosphor-react";
import { FormEvent, useState } from "react";
import { FeedbackType, feedbackTypes } from "..";
// import { api } from "../../../lib/api";
import { CloseButton } from "../../CloseButton";
import { Loading } from "../../Loading";
import { ScreenshotButton } from "../ScreenshotButton";

interface FeedbackContentStepProps {
    feedbackType: FeedbackType;
    onFeedbackRestartRequested: () => void;
    onFeedbackSent: () => void;
}

export function FeedbackContentStep({
    feedbackType,
    onFeedbackRestartRequested,
    onFeedbackSent
}: FeedbackContentStepProps) {

    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [comment, setComment] = useState<string>("");
    const [isSendingFeedback, setIsSendingFeedback] = useState(false);

    const feedbackInfo = feedbackTypes[feedbackType];

    async function handleSubmitFeedback(event: FormEvent<HTMLFormElement>) {

        event.preventDefault();

        setIsSendingFeedback(true)
        
        // await api.post("/feedbacks", {
        //     type: feedbackType,
        //     comment,
        //     screenshot
        // });

        setIsSendingFeedback(false)
        onFeedbackSent()
    }   

    return (
        <>
            <header>
                <IconButton
                    type={'button'}
                    variant='ghost'
                    aria-label='Send email'
                    icon={<ArrowLeft />}
                    onClick={onFeedbackRestartRequested}
                    top={1}
                    left={1}
                    position={'absolute'}
                    color={'blackAlpha.300'}
                    background={'transparent'}
                    _hover={{
                        color: 'gray',
                    }}
                />

                <Flex 
                    alignItems={'center'}
                    gap={2}
                >
                    <Image
                        width={6}
                        height={6}
                        src={feedbackInfo.image.source}
                        alt={feedbackInfo.image.alt}
                    />
                <Heading as='h1' size='md'>{feedbackInfo.title}</Heading>
                </Flex>

                <CloseButton />
            </header>

            <form
                onSubmit={handleSubmitFeedback}
                // className="my-4 m-full"
                style={{
                    margin: '1rem auto',
                }}
            >
                <textarea
                    className="min-w-[304px] w-full min-h-[112px] text-sm placeholder-zinc-400 text-zinc-100 border-zinc-600 bg-transparent rounded-md focus:border-brand-500 focus:ring-brand-500 focus:ring-1 focus:outline-none resize-none scrollbar-thumb-zinc-700 scrollbar-track-transparent scrollbar-thin"
                    placeholder="Conte com detalhes o que está acontencendo..."
                    onChange={(event) => setComment(event.target.value)}
                />

                <Flex
                    gap={2}
                    mt={2}
                >
                    <ScreenshotButton 
                        screenshot={screenshot}
                        onScreenshotTook={setScreenshot}
                    />

                    <Button
                        type="submit"
                        className="p-2 bg-brand-500 rounded-md border-transparent flex-1 
                        lex justify-center items-center text-sm hover:bg-brand-300 focus:outline-none 
                        focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-brand-500 
                        transition-colors disabled:opacity-50 disabled:hover:bg-brand-500"
                        disabled={comment.length === 0 || isSendingFeedback }

                    >
                        {isSendingFeedback ? <Loading /> : "Enviar feedback"}
                    </Button>
                </Flex>
            </form>

        </>
    )
}