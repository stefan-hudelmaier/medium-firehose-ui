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
  Link,
  styled,
  keyframes,
  IconButton
} from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import GitHubIcon from '@mui/icons-material/GitHub'

// Pulsing animation for connected status
const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
`;

const PulsingDot = styled('span')(({ theme }) => ({
  display: 'inline-block',
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  marginRight: 8,
  animation: `${pulse} 2s infinite`,
}));

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
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.3 }}>
        <Link
          href={message.link}
          target="_blank"
          rel="noopener"
          underline="hover"
          color="text.primary"
          sx={{
            '&:hover': {
              color: 'primary.main'
            }
          }}
        >
          {message.title || 'Untitled'}
        </Link>
      </Typography>

      {message.author && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          By {message.author}
        </Typography>
      )}

      {message.categories && message.categories.length > 0 && (
        <Box sx={{ mt: 1.5, mb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {message.categories.map((category, idx) => (
            <Chip
              key={idx}
              component="a"
              href={`https://medium.com/tag/${category.toLowerCase().replace(/\s+/g, '-')}`}
              target="_blank"
              rel="noopener"
              clickable
              label={`#${category}`}
              size="small"
              sx={{
                mr: 0.5,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText'
                }
              }}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        {message.published ? new Date(message.published).toLocaleString() : 'Unknown'}
      </Typography>
    </Paper>
  );
};

function App() {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [error, setError] = useState(null);

  useEffect(() => {
    const gcmbPublicWebToken = "HpWTbUHJdB6mPBN4oWHVHJyOAKco1WME";
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
      setConnectionStatus('Connected');
      setError(null);
      console.log('Connected to MQTT broker');

      // Subscribe to topic
      const topic = 'medium/medium-firehose/all';
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
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: 'white',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
            width: '100%',
            maxWidth: '100%',
            m: 0,
            p: 0
          }}
        >
          <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, maxWidth: '100%' }}>
            <Toolbar
              disableGutters
              sx={{
                minHeight: 64,
                justifyContent: 'space-between',
                maxWidth: '1200px',
                width: '100%',
                mx: 'auto',
                px: { xs: 0, md: 2 }
              }}
            >
              <Typography variant="h6" component="div" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                Medium Firehose
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  component="a"
                  href="https://github.com/stefan-hudelmaier/gcmb-medium-firehose"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub repository"
                  color="inherit"
                  sx={{
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  <GitHubIcon />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {connectionStatus === 'connecting' ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : connectionStatus === 'Connected' ? (
                    <>
                      <PulsingDot />
                      <Typography variant="body2" color="success.main">
                        {connectionStatus}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {connectionStatus}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        <Box
          component="main"
          sx={{
            flex: 1,
            width: '100%',
            p: { xs: 2, md: 4 },
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '1200px', px: { xs: 0, md: 2 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="body1" sx={{pb: 2}}>
              New posts will be displayed as they are published. Data is received via MQTT over Websockets from <Link href="https://gcmb.io/medium/medium-firehose">https://gcmb.io/medium/medium-firehose</Link>.
              The <Link href="https://medium.oldcai.com/">top 100</Link> Medium tags are considered.
            </Typography>

            {messages.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Waiting for posts to be published...
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {messages.map((message, index) => (
                  <MessageCard key={index} message={message} index={index} />
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App
