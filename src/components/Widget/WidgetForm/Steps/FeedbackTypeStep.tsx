import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { FeedbackType, feedbackTypes } from ".."
import { CloseButton } from "../../CloseButton"

interface FeedbackTypeStepProps {
    onFeedbackTypeChanged: (feedbackType: FeedbackType | null) => void;
}


export function FeedbackTypeStep({
    onFeedbackTypeChanged,
}: FeedbackTypeStepProps) {

    return (
        <>
            <header>
                <Heading as='h1' size='md'>Give yout feedback</Heading>

                <CloseButton />
            </header>

            <Flex
                py={8}
                gap={2}
                width={'full'}
            >
                {Object.entries(feedbackTypes).map(([key, value]) => {
                    return (
                        <Button
                            key={key}
                            className="bg-zinc-800 rounded-lg py-5 w-24 flex-1 flex-col 
                            items-center gap-2 border-2 border-transparent hover:border-brand-500 
                            focus:border-brand-500 focus:outline-none"
                            onClick={() => onFeedbackTypeChanged(key as FeedbackType)}
                            type={'button'}
                            bg={'blackAlpha.100'}
                            rounded={'lg'}
                            py={5}
                            width={'6rem'}
                            display={'flex'}
                            flexDirection={'column'}
                            alignItems={'center'}
                            gap={2}
                            border={2}
                            borderColor={'transparent'}
                            _hover={{
                                border: '2px solid gray'
                            }}
                            _focus={{
                                borderColor: 'blackAlpha.200',
                                outline: 'none'
                            }}
                            flex={'1 1 0%'}
                            height={'100%'}
                        >
                            <img src={value.image.source} alt={value.image.alt} />
                            <span>{value.title}</span>
                        </Button>
                    )
                })}
            </Flex>
        </>
    )
}