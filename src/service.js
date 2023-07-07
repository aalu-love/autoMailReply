const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Gmail API credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// Create a Gmail API client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const gmailClient = google.gmail({ version: 'v1', auth: oAuth2Client });

// Nodemailer transport configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: 'your-email@gmail.com',
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    refreshToken: REFRESH_TOKEN,
    accessToken: oAuth2Client.getAccessToken(),
  },
});

// Retrieve new emails from Gmail
async function fetchNewEmails() {
  const response = await gmailClient.users.messages.list({
    userId: 'me',
    q: 'is:unread', // Retrieve only unread emails
  });

  const emails = response.data.messages || [];
  return emails;
}

// Send a reply email
async function sendReply(email) {
  const replyText = 'Thank you for your email. I am currently on vacation and will reply when I return.';
  const threadId = email.threadId;

  // Check if the email thread has prior replies
  const threadResponse = await gmailClient.users.threads.get({
    userId: 'me',
    id: threadId,
  });
  const messages = threadResponse.data.messages || [];

  // If no prior replies, send the reply email
  if (messages.length === 1) {
    const reply = {
      userId: 'me',
      threadId,
      resource: {
        raw: Buffer.from(
          `To: ${email.from}\n` +
          'Subject: Vacation Auto-Reply\n' +
          '\n' +
          replyText
        ).toString('base64'),
      },
    };

    await gmailClient.users.messages.send(reply);
  }
}

// Apply a label to the email and move it to the labeled category
async function applyLabel(email) {
  const labelName = 'Vacation Auto-Replies';

  // Retrieve all existing labels
  const labelsResponse = await gmailClient.users.labels.list({
    userId: 'me',
  });
  const labels = labelsResponse.data.labels || [];

  // Check if the label already exists
  let label = labels.find(l => l.name === labelName);

  // If the label doesn't exist, create it
  if (!label) {
    label = await gmailClient.users.labels.create({
      userId: 'me',
      requestBody: {
        name: labelName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      },
    });
  }

  // Apply the label to the email
  await gmailClient.users.messages.modify({
    userId: 'me',
    id: email.id,
    requestBody: {
      addLabelIds: [label.id],
    },
  });
}

// Main function to handle the email processing sequence
async function processEmails() {
  try {
    const emails = await fetchNewEmails();

    for (const email of emails) {
      await sendReply(email);
      await applyLabel(email);
    }
  } catch (error) {
    console.error(error);
    // Handle any errors that occur during the email processing
  }
}

// Start the email processing loop with random intervals
function startProcessingLoop() {
  const minInterval = 45000; // 45 seconds
  const maxInterval = 120000; // 120 seconds

  setInterval(() => {
    processEmails();
  }, Math.random() * (maxInterval - minInterval) + minInterval);
}

// Start the email processing loop
startProcessingLoop();
