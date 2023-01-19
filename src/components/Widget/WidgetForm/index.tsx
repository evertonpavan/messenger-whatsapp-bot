import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import bugImageUrl from "../../../assets/bug.svg";
import ideaImageUrl from "../../../assets/idea.svg";
import thoughtImageUrl from "../../../assets/thought.svg";
import { FeedbackTypeStep } from "./Steps/FeedbackTypeStep";
import { FeedbackContentStep } from "./Steps/FeedbackContentStep";
import { FeedbackSuccessStep } from "./Steps/FeedbackSuccessStep";


export const feedbackTypes = {
    BUG: {
        title: "Bug",
        image: {
            source: bugImageUrl,
            alt: "bug image"
        }
    },
    IDEA: {
        title: "Idea",
        image: {
            source: ideaImageUrl,
            alt: "lamp image"
        }
    },
    OTHER: {
        title: "Other",
        image: {
            source: thoughtImageUrl,
            alt: "thought image"
        }
    }
}

export type FeedbackType = keyof typeof feedbackTypes;

function WidgetForm() {

    const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
    const [feedbackSent, setFeedbackSent] = useState(false);

    function handleRestartFeedback() {
        setFeedbackSent(false)
        setFeedbackType(null);
    }

    return (
        <Flex
            direction={'column'}
            alignItems={'center'}
            backgroundColor={'blackAlpha.300'}
            position={'relative'}
            padding={4}
            rounded={'2xl'}
            mb={4}
            boxShadow={'lg'}
            w={'calc(100vw-2rem)'}
        >

            {feedbackSent ? (
                <FeedbackSuccessStep
                    onFeedbackRestartRequested={handleRestartFeedback}
                />
            ) : (
                <>
                    {!feedbackType ? (
                        <FeedbackTypeStep
                            onFeedbackTypeChanged={setFeedbackType}
                        />
                    ) : (
                        <FeedbackContentStep
                            feedbackType={feedbackType}
                            onFeedbackRestartRequested={handleRestartFeedback}
                            onFeedbackSent={() => setFeedbackSent(true)}
                        />
                    )}
                </>
            )}

            <footer style={{ fontSize: '0.75rem', lineHeight: '1rem', opacity: '0.7' }}>
                Made with ♥ in Brazil
            </footer>
        </Flex>

    );
}

export { WidgetForm };