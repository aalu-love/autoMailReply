const { google } = require('googleapis');
require('dotenv').config();

// OAuth2 configuration
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.labels',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose'
];

// Create an OAuth2 client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Generate the authorization URL
const authorizationURL = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: SCOPES,
    include_granted_scopes: true
});

// Create a Gmail API client
const gmailClient = google.gmail({ version: 'v1', auth: oAuth2Client });

// Function to generate a random interval between min and max (inclusive)
function getRandomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Exchange the authorization code for tokens
async function getGoogleOAuthTokens({ code }) {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials({ refresh_token: tokens?.refresh_token });
    return tokens;
}

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
async function sendReply({ email }) {
    const replyText = 'Thank you for your email. I am currently on vacation and will reply when I return.';
    const threadId = email.threadId;

    // Check if the email thread has prior replies
    const threadResponse = await gmailClient.users.threads.get({
        userId: 'me',
        id: threadId,
    });
    const messages = threadResponse.data.messages || [];

    // Get the sender's email address
    const headers = messages[0].payload?.headers;
    const fromHeader = headers.find(header => header.name.toLowerCase() === 'from');
    const senderEmail = fromHeader.value;

    // If no prior replies, send the reply email
    if (messages.length === 1) {
        const reply = {
            userId: 'me',
            threadId,
            resource: {
                raw: Buffer.from(
                    `To: ${senderEmail}\n` +
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
async function applyLabel({ email }) {
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
        const createLabelResponse = await gmailClient.users.labels.create({
            userId: 'me',
            requestBody: {
                name: labelName,
                labelListVisibility: 'labelShow',
                messageListVisibility: 'show',
            },
        });

        label = createLabelResponse.data;
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


// Function to execute the email processing sequence with a random interval
async function executeEmailProcessing() {
    try {
        const emails = await fetchNewEmails();

        if (emails?.length === 0) {
            console.log('No emails to send');
            return { message: 'No emails to send' };
        }

        for (const email of emails) {
            setTimeout(async () => {
                await sendReply({ email });
                await applyLabel({ email });
                console.log('Sent reply and applied label successfully');
            }, getRandomInterval(45000, 120000));
        }
        return { message: 'All mail sent successfully' };
    } catch (error) {
        console.error(error);
        // Handle any errors that occur during the email processing
    }
}


module.exports = {
    authorizationURL, // URL for Google OAuth2 authorization
    getGoogleOAuthTokens, // Function to exchange authorization code for tokens
    executeEmailProcessing, // Function to start the email processing loop
};
