import { useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
} from '@mui/material';
import axios from 'axios';
import { useIntegrationStore } from './store/Store';

const endpointMapping = {
    'Notion': 'notion',
    'Airtable': 'airtable',
    'HubSpot': 'hubspot'
};

export const DataForm = ({ integrationType, credentials }) => {
    const loadedData = useIntegrationStore(state => state.loadedData);
    const setLoadedData = useIntegrationStore(state => state.setLoadedData);
    const clearLoadedData = useIntegrationStore(state => state.clearLoadedData);

    const endpoint = endpointMapping[integrationType];

    // Reset loadedData when integrationType or credentials change
    useEffect(() => {
        clearLoadedData();
    }, [integrationType, credentials, clearLoadedData]);

    const handleLoad = async () => {
        try {
            const formData = new FormData();
            formData.append('credentials', JSON.stringify(credentials));
            const response = await axios.post(`http://localhost:8000/integrations/${endpoint}/load`, formData);
            setLoadedData(response.data);
            console.log(response.data);
        } catch (e) {
            alert(e?.response?.data?.detail);
        }
    }

    return (
        <Box display='flex' justifyContent='center' alignItems='center' flexDirection='column' width='100%'>
            <Box display='flex' flexDirection='column' width='100%'>
                <TextField
                    label="Loaded Data"
                    value={loadedData ? JSON.stringify(loadedData, null, 2) : ''}
                    sx={{mt: 2}}
                    InputLabelProps={{ shrink: true }}
                    multiline
                    minRows={3}
                    disabled
                />
                <Button
                    onClick={handleLoad}
                    sx={{mt: 2}}
                    variant='contained'
                >
                    Load Data
                </Button>
                <Button
                    onClick={clearLoadedData}
                    sx={{mt: 1}}
                    variant='contained'
                >
                    Clear Data
                </Button>
            </Box>
        </Box>
    );
}
