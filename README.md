# Medium Firehose UI

A React application that connects to an MQTT server via WebSocket, subscribes to a topic, and displays received XML messages in real-time.

## Features

- Connects to a remote MQTT server via MQTT over WebSocket
- Subscribes to an MQTT topic ('medium/firehose' by default)
- Parses received messages as XML
- Displays new messages at the top of the page, pushing existing messages down
- Built with Material-UI for a responsive and modern UI
- Real-time connection status monitoring
- Error handling for connection and message parsing issues

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd medium-firehose-ui
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:5173)

3. The application will automatically connect to the MQTT broker and subscribe to the 'medium/firehose' topic

## Testing

A test script is included to help verify the application's functionality:

1. Install Node.js if you haven't already

2. Run the test script:
   ```
   node test-mqtt-publish.js
   ```

This script will publish sample XML messages to the 'medium/firehose' topic, which should appear in the UI.

## Configuration

You can modify the MQTT connection settings in `src/App.jsx`:

```javascript
const mqttConfig = {
  protocol: 'wss', // WebSocket Secure
  host: 'broker.emqx.io', // Change to your MQTT broker
  port: 8084, // Change to your broker's WebSocket port
  clientId: `mqtt_${Math.random().toString(16).slice(2, 10)}`,
  // Add username and password if required
  // username: 'your_username',
  // password: 'your_password',
};
```

You can also change the subscription topic:

```javascript
const topic = 'medium/firehose'; // Change to your desired topic
```

## XML Message Format

The application expects XML messages in the Atom format:

```xml
<?xml version="1.0" ?>
<entry xmlns="http://www.w3.org/2005/Atom">
  <id>https://medium.com/p/66fc2e59f977</id>
  <published>2025-05-04T07:09:12.000Z</published>
  <updated>2025-05-04T07:09:12.287Z</updated>
  <title>Article Title</title>
  <author>
    <name>Author Name</name>
  </author>
  <category term="category1"/>
  <category term="category2"/>
  <link title="Article Title" rel="alternate" href="https://example.com/article-url" type="text/html"/>
  <summary type="html">HTML content for the summary</summary>
</entry>
```

The application will display:
- The title as a headline with a link to the source
- The author name
- The summary content (HTML is supported)
- Categories as chips
- Publication date

## Built With

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Material-UI](https://mui.com/) - Component framework
- [mqtt.js](https://github.com/mqttjs/MQTT.js) - MQTT client library
