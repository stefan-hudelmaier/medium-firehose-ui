// Simple script to test publishing XML messages to the MQTT topic
// Run with: node test-mqtt-publish.js

const mqtt = require('mqtt');

// MQTT connection configuration
const mqttConfig = {
  protocol: 'wss', // WebSocket Secure
  host: 'broker.emqx.io',
  port: 8084,
  clientId: `mqtt_publisher_${Math.random().toString(16).slice(2, 10)}`,
};

const url = `${mqttConfig.protocol}://${mqttConfig.host}:${mqttConfig.port}/mqtt`;

// Connect to MQTT broker
console.log('Connecting to MQTT broker...');
const client = mqtt.connect(url, mqttConfig);

// Sample XML messages in Atom format
const sampleMessages = [
  `<?xml version="1.0" ?>
<entry xmlns="http://www.w3.org/2005/Atom">
  <id>https://medium.com/p/66fc2e59f977</id>
  <published>2025-05-04T07:09:12.000Z</published>
  <updated>2025-05-04T07:09:12.287Z</updated>
  <title>Can "AI" Destroy Global Business Ecosystems? Why Isn't Anyone Talking About It?</title>
  <author>
    <name>Manoj Bhadana</name>
  </author>
  <category term="ai"/>
  <category term="design"/>
  <category term="growth"/>
  <category term="business"/>
  <category term="economy"/>
  <link title="Can "AI" Destroy Global Business Ecosystems? Why Isn't Anyone Talking About It?" rel="alternate" href="https://bhadana-manoj.medium.com/can-ai-destroy-global-business-ecosystems-why-isnt-anyone-talking-about-it-66fc2e59f977?source=rss------business-5" type="text/html"/>
  <summary type="html">&lt;div class=&quot;medium-feed-item&quot;&gt;&lt;p class=&quot;medium-feed-image&quot;&gt;&lt;a href=&quot;https://bhadana-manoj.medium.com/can-ai-destroy-global-business-ecosystems-why-isnt-anyone-talking-about-it-66fc2e59f977?source=rss------business-5&quot;&gt;&lt;img src=&quot;https://cdn-images-1.medium.com/max/1200/1*S4H_5B5CqNvWtW07IfdFMA.jpeg&quot; width=&quot;1200&quot;&gt;&lt;/a&gt;&lt;/p&gt;&lt;p class=&quot;medium-feed-snippet&quot;&gt;AI&amp;#x2019;s rapid rise threatens not just jobs but entire business ecosystems. As companies like Duolingo and Canva embrace automation, AI giants&amp;#x2026;&lt;/p&gt;&lt;p class=&quot;medium-feed-link&quot;&gt;&lt;a href=&quot;https://bhadana-manoj.medium.com/can-ai-destroy-global-business-ecosystems-why-isnt-anyone-talking-about-it-66fc2e59f977?source=rss------business-5&quot;&gt;Continue reading on Medium »&lt;/a&gt;&lt;/p&gt;&lt;/div&gt;</summary>
</entry>`,
  `<?xml version="1.0" ?>
<entry xmlns="http://www.w3.org/2005/Atom">
  <id>https://medium.com/p/abc123def456</id>
  <published>2025-05-03T10:15:30.000Z</published>
  <updated>2025-05-03T10:15:30.123Z</updated>
  <title>The Future of Web Development: What to Expect in 2026</title>
  <author>
    <name>Jane Developer</name>
  </author>
  <category term="webdev"/>
  <category term="javascript"/>
  <category term="programming"/>
  <category term="technology"/>
  <link title="The Future of Web Development: What to Expect in 2026" rel="alternate" href="https://jane-developer.medium.com/the-future-of-web-development-what-to-expect-in-2026-abc123def456" type="text/html"/>
  <summary type="html">&lt;div class=&quot;medium-feed-item&quot;&gt;&lt;p class=&quot;medium-feed-image&quot;&gt;&lt;a href=&quot;https://jane-developer.medium.com/the-future-of-web-development-what-to-expect-in-2026-abc123def456&quot;&gt;&lt;img src=&quot;https://cdn-images-1.medium.com/max/1200/1*example-image.jpeg&quot; width=&quot;1200&quot;&gt;&lt;/a&gt;&lt;/p&gt;&lt;p class=&quot;medium-feed-snippet&quot;&gt;Web development is evolving rapidly. Here's what to expect in the coming year, from AI-assisted coding to new frameworks and tools that will change how we build for the web.&lt;/p&gt;&lt;p class=&quot;medium-feed-link&quot;&gt;&lt;a href=&quot;https://jane-developer.medium.com/the-future-of-web-development-what-to-expect-in-2026-abc123def456&quot;&gt;Continue reading on Medium »&lt;/a&gt;&lt;/p&gt;&lt;/div&gt;</summary>
</entry>`,
  `<?xml version="1.0" ?>
<entry xmlns="http://www.w3.org/2005/Atom">
  <id>https://medium.com/p/xyz789uvw321</id>
  <published>2025-05-02T14:22:45.000Z</published>
  <updated>2025-05-02T14:22:45.789Z</updated>
  <title>Sustainable Living: Small Changes with Big Impact</title>
  <author>
    <name>Eco Enthusiast</name>
  </author>
  <category term="sustainability"/>
  <category term="environment"/>
  <category term="climate"/>
  <category term="lifestyle"/>
  <link title="Sustainable Living: Small Changes with Big Impact" rel="alternate" href="https://eco-enthusiast.medium.com/sustainable-living-small-changes-with-big-impact-xyz789uvw321" type="text/html"/>
  <summary type="html">&lt;div class=&quot;medium-feed-item&quot;&gt;&lt;p class=&quot;medium-feed-image&quot;&gt;&lt;a href=&quot;https://eco-enthusiast.medium.com/sustainable-living-small-changes-with-big-impact-xyz789uvw321&quot;&gt;&lt;img src=&quot;https://cdn-images-1.medium.com/max/1200/1*another-example.jpeg&quot; width=&quot;1200&quot;&gt;&lt;/a&gt;&lt;/p&gt;&lt;p class=&quot;medium-feed-snippet&quot;&gt;Living sustainably doesn't have to mean drastic lifestyle changes. These small, everyday adjustments can add up to make a significant positive impact on our planet.&lt;/p&gt;&lt;p class=&quot;medium-feed-link&quot;&gt;&lt;a href=&quot;https://eco-enthusiast.medium.com/sustainable-living-small-changes-with-big-impact-xyz789uvw321&quot;&gt;Continue reading on Medium »&lt;/a&gt;&lt;/p&gt;&lt;/div&gt;</summary>
</entry>`
];

// Handle connection
client.on('connect', () => {
  console.log('Connected to MQTT broker');

  const topic = 'medium/firehose';
  let messageIndex = 0;

  // Publish a message immediately
  publishMessage();

  // Set up interval to publish messages every 5 seconds
  const interval = setInterval(publishMessage, 5000);

  function publishMessage() {
    const message = sampleMessages[messageIndex % sampleMessages.length];
    console.log(`Publishing message ${messageIndex + 1} to ${topic}`);
    client.publish(topic, message);

    messageIndex++;

    // Stop after publishing all sample messages
    if (messageIndex >= sampleMessages.length) {
      clearInterval(interval);
      console.log('All messages published. Disconnecting...');
      client.end();
    }
  }
});

// Handle errors
client.on('error', (err) => {
  console.error('MQTT error:', err);
  client.end();
});
