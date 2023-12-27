import { Box } from '@chakra-ui/react';
import { ChangeEvent, useCallback } from 'react';
import { readFile } from 'src/utils/helpers';


function LoadLibrary() {
    const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const txt = readFile(file);
        console.log(txt)
    }, [])

    return  (
        <Box>
            Input here:
            <input
            accept='xml'
            type='file'
            multiple={false}
            onInput={handleFileChange}
            />
        </Box>
    )
}

export default LoadLibrary;