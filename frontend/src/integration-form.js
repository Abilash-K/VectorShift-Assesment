import {
    Box,
    Autocomplete,
    TextField,
    Paper,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Divider,
} from '@mui/material';
import { AirtableIntegration } from './integrations/airtable';
import { NotionIntegration } from './integrations/notion';
import { DataForm } from './data-form';
import { HubSpotIntegration } from './integrations/hubspot';
import { useIntegrationStore } from './store/Store';

const integrationMapping = {
    'Notion': NotionIntegration,
    'Airtable': AirtableIntegration,
    'HubSpot': HubSpotIntegration
};

export const IntegrationForm = () => {
    const {
        user, setUser,
        org, setOrg,
        currType, setCurrType,
        integrationParams, setIntegrationParams,
    } = useIntegrationStore();

    const CurrIntegration = integrationMapping[currType];

    return (
        <Box
            minHeight="100vh"
            display="flex"
            justifyContent="center"
            alignItems="center"
            bgcolor="#f5f6fa"
        >
            <Paper elevation={6} sx={{ p: 4, borderRadius: 4, minWidth: 400, maxWidth: 500 }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: "#1976d2" }}>
                    VectorShift Integrations
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box display='flex' flexDirection='column' gap={2}>
                    <TextField
                        label="User"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                        variant="outlined"
                        size="small"
                    />
                    <TextField
                        label="Organization"
                        value={org}
                        onChange={(e) => setOrg(e.target.value)}
                        variant="outlined"
                        size="small"
                    />
                    <Autocomplete
                        id="integration-type"
                        options={Object.keys(integrationMapping)}
                        sx={{ width: '100%' }}
                        renderInput={(params) => <TextField {...params} label="Integration Type" variant="outlined" size="small" />}
                        onChange={(e, value) => setCurrType(value)}
                        value={currType}
                    />
                </Box>
                {currType &&
                    <Card elevation={2} sx={{ mt: 4, mb: 2, borderRadius: 2 }}>
                        <CardHeader
                            title={
                                <Typography variant="h6" color="primary">
                                    {currType} Parameters
                                    {console.log(currType)}
                                </Typography>
                            }
                            sx={{ pb: 0 }}
                        />
                        <CardContent>
                            <CurrIntegration
                                user={user}
                                org={org}
                                integrationParams={integrationParams}
                                setIntegrationParams={setIntegrationParams}
                            />
                        </CardContent>
                    </Card>
                }
                {integrationParams?.credentials &&
                    <Card elevation={1} sx={{ mt: 2, borderRadius: 2 }}>
                        <CardHeader
                            title={
                                <Typography variant="subtitle1" color="secondary">
                                    Loaded Data
                                </Typography>
                            }
                            sx={{ pb: 0 }}
                        />
                        <CardContent>
                            <DataForm
                                integrationType={integrationParams?.type}
                                credentials={integrationParams?.credentials}
                            />
                        </CardContent>
                    </Card>
                }
            </Paper>
        </Box>
    );
}
