import { useState, useEffect } from 'react'
import mqtt from 'mqtt'
import {
  Container,
  Typography,
  Box,
  Paper,
  AppBar,
  Toolbar,
  CssBaseline,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Link
} from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
  },
});

// Message component to display received messages
const MessageCard = ({ message, index }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 2,
        borderLeft: '4px solid',
        borderColor: index === 0 ? 'primary.main' : 'grey.300',
        backgroundColor: index === 0 ? 'rgba(85, 108, 214, 0.05)' : 'white'
      }}
    >
      <Typography variant="h5" gutterBottom>
        <Link href={message.link} target="_blank" rel="noopener" underline="hover">
          {message.title || 'Untitled'}
        </Link>
      </Typography>

      {message.author && (
        <Typography variant="subtitle1" gutterBottom>
          By {message.author}
        </Typography>
      )}

      {message.summary && (
        <Typography variant="body1" gutterBottom dangerouslySetInnerHTML={{ __html: message.summary }} />
      )}

      {message.categories && message.categories.length > 0 && (
        <Box sx={{ mt: 1, mb: 1 }}>
          {message.categories.map((category, idx) => (
            <Chip
              key={idx}
              label={category}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}

      <Typography variant="caption" color="text.secondary">
        Published: {message.published ? new Date(message.published).toLocaleString() : 'Unknown'}
      </Typography>
    </Paper>
  );
};

function App() {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);

  useEffect(() => {
    //const gcmbPublicWebToken = "HpWTbUHJdB6mPBN4oWHVHJyOAKco1WME";
    const gcmbPublicWebToken = "Eud3aix1sewae5pooji6oophiu9ahdah";
    const url = `wss://public.gcmb.io/?token=${gcmbPublicWebToken}`;
    const clientId = Math.random().toString(16).substring(2, 8);

    const options = {
      keepalive: 30,
      clientId,
      protocolId: 'MQTT',
      protocolVersion: 4,
      clean: true,
      connectTimeout: 30 * 1000,
      rejectUnauthorized: false,
      username: gcmbPublicWebToken,
      password: ''
    }

    setConnectionStatus('connecting');
    const client = mqtt.connect(url, options);

    // Handle connection events
    client.on('connect', () => {
      setConnectionStatus('connected');
      console.log('Connected to MQTT broker');

      // Subscribe to topic
      const topic = 'medium/firehose-firehose/#';
      client.subscribe(topic, (err) => {
        if (err) {
          console.error('Subscription error:', err);
          setError(`Failed to subscribe: ${err.message}`);
        } else {
          console.log(`Subscribed to ${topic}`);
        }
      });
    });

    // Handle incoming messages
    client.on('message', (topic, payload) => {
      console.log(`Received message on ${topic}: ${payload.toString()}`);

      try {
        // Parse XML message
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(payload.toString(), 'text/xml');

        // Extract data from XML
        const title = xmlDoc.querySelector('title')?.textContent || 'Untitled';
        const id = xmlDoc.querySelector('id')?.textContent;
        const published = xmlDoc.querySelector('published')?.textContent;
        const updated = xmlDoc.querySelector('updated')?.textContent;
        const author = xmlDoc.querySelector('author name')?.textContent;

        // Extract categories
        const categoryElements = xmlDoc.querySelectorAll('category');
        const categories = Array.from(categoryElements).map(el => el.getAttribute('term')).filter(Boolean);

        // Extract link
        const linkElement = xmlDoc.querySelector('link[rel="alternate"]');
        const link = linkElement ? linkElement.getAttribute('href') : null;

        // Extract summary (HTML content)
        const summary = xmlDoc.querySelector('summary')?.textContent;

        // Create message object
        const newMessage = {
          id,
          title,
          published,
          updated,
          author,
          categories,
          link,
          summary,
          timestamp: new Date().toLocaleString(),
          raw: payload.toString()
        };

        // Add new message at the top
        setMessages(prevMessages => [newMessage, ...prevMessages]);
      } catch (err) {
        console.error('Error parsing message:', err);
        setError(`Failed to parse message: ${err.message}`);
      }
    });

    // Handle errors
    client.on('error', (err) => {
      console.error('MQTT error:', err);
      setConnectionStatus('error');
      setError(`MQTT error: ${err.message}`);
    });

    // Clean up on component unmount
    return () => {
      client.end();
      console.log('MQTT connection closed');
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Medium Firehose
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {connectionStatus === 'connecting' && (
                <CircularProgress color="inherit" size={24} sx={{ mr: 1 }} />
              )}
              <Typography variant="body2">
                Status: {connectionStatus}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          px: 2 // Add some padding on small screens
        }}>
          <Container
            maxWidth="md"
            sx={{
              mt: 4,
              width: '100%',
              maxWidth: { xs: '100%', sm: '600px', md: '800px' },
              mx: 'auto' // Center the container
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="h4" gutterBottom>
              Medium Articles
            </Typography>

            {messages.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Waiting for messages...
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {messages.map((message, index) => (
                  <MessageCard key={index} message={message} index={index} />
                ))}
              </Stack>
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App
