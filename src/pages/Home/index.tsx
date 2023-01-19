import { Flex, Heading, Text } from '@chakra-ui/react'
import { Form } from '../../components/Form'
import { Widget } from '../../components/Widget';

function Home() {
    return (
        <>
            <Flex>
                <Form />
                <Widget />
            </Flex >
        </>
    )
}

export { Home };