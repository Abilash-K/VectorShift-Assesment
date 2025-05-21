import { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Snackbar,
    Alert,
    CircularProgress,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
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

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);

    const endpoint = endpointMapping[integrationType];

    // Reset loadedData when integrationType or credentials change
    useEffect(() => {
        clearLoadedData();
    }, [integrationType, credentials, clearLoadedData]);

    const handleLoad = async () => {
        setLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('credentials', JSON.stringify(credentials));
            const response = await axios.post(`http://localhost:8000/integrations/${endpoint}/load`, formData);
            setLoadedData(response.data);
        } catch (e) {
            setError(e?.response?.data?.detail || 'Failed to load data');
            setOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => setOpen(false);

    // Helper: Render loaded data as a table if possible
    const renderTable = (data) => {
        if (!Array.isArray(data) || data.length === 0) return null;
        const keys = Object.keys(data[0]);
        return (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {keys.map((key) => (
                                <TableCell key={key}>{key}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, idx) => (
                            <TableRow key={idx}>
                                {keys.map((key) => (
                                    <TableCell key={key}>{String(row[key])}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <Box display='flex' justifyContent='center' alignItems='center' flexDirection='column' width='100%'>
            <Box display='flex' flexDirection='column' width='100%'>
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                    Loaded Data
                </Typography>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 2, mb: 2 }}>
                        <CircularProgress />
                    </Box>
                ) : loadedData && Array.isArray(loadedData) && loadedData.length > 0 ? (
                    renderTable(loadedData)
                ) : (
                    <TextField
                        label="Loaded Data"
                        value={loadedData ? JSON.stringify(loadedData, null, 2) : ''}
                        sx={{ mt: 2 }}
                        InputLabelProps={{ shrink: true }}
                        multiline
                        minRows={3}
                        disabled
                    />
                )}
                <Button
                    onClick={handleLoad}
                    sx={{ mt: 2 }}
                    variant='contained'
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={18} />}
                >
                    Load Data
                </Button>
                <Button
                    onClick={clearLoadedData}
                    sx={{ mt: 1 }}
                    variant='contained'
                    color="secondary"
                    disabled={loading}
                >
                    Clear Data
                </Button>
            </Box>
            <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
}
