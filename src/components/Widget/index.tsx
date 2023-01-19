import { ChatTeardropDots } from 'phosphor-react';
import {
    PopoverTrigger,
    PopoverContent,
    Popover,
    Box,
    Flex,
    Text,
} from '@chakra-ui/react'
import { WidgetForm } from './WidgetForm';

function Widget() {

    return (
        <Box
            position={'absolute'}
            bottom={100}  // 4
            right={4}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'flex-end'}
        >
            <Popover>
                <PopoverTrigger>
                    <Flex direction={'row'} alignItems={'center'} bg={'gray.700'} paddingX={3} rounded={'full'} height={'3rem'} color={'white'} role={'group'} as={'button'}>
                        <ChatTeardropDots
                            width={25} height={25}
                        />
                        <Text
                            maxWidth={'0rem'}
                            overflow={'hidden'}
                            transition={'all cubic-bezier(0.4, 0, 0.2, 1) 150ms'}
                            transitionTimingFunction={'ease'}
                            transitionDuration={'0.5s'}
                            _groupHover={{
                                maxWidth: '20rem' ,
                            }}
                            as={'span'}
                        >
                            <span style={{ paddingLeft: '0.5rem', width: '100%', wordWrap: 'normal' }} >
                                Feedback
                            </span>
                        </Text>
                    </Flex>
                </PopoverTrigger>
                <PopoverContent>
                    {/* <PopoverArrow /> */}
                    {/* <PopoverCloseButton /> */}
                    {/* <PopoverHeader>Deixe seu feedback</PopoverHeader> */}
                    {/* <PopoverBody> */}
                        <WidgetForm />
                    {/* </PopoverBody> */}
                </PopoverContent>
            </Popover>
        </Box>
    )
}

export { Widget };
