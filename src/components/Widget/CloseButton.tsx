import { PopoverCloseButton } from '@chakra-ui/react';

export function CloseButton() {
    return (
                <PopoverCloseButton 
                    title='Close feedback form'
                    color={'blackAlpha.300'}
                    top={3}
                    right={2}
                /> 
    );
}