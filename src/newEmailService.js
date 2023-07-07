const { google } = require('googleapis');
const axios = require('axios');
require('dotenv').config();

// OAuth2 configuration
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// Create an OAuth2 client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Generate the authorization URL
const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: SCOPES,
    include_granted_scopes: true
});

async function getGoogleOAuthTokens({ code }) {
    // Exchange the authorization code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    return tokens
}

async function googleOAuthHandler({ code }) {
    const user_token = await getGoogleOAuthTokens({ code });
    return user_token;
}

async function createMailClient({ refresh_token }) {
    // Create a Gmail API client
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oAuth2Client.setCredentials({ refresh_token: refresh_token });
    const gmailClient = google.gmail({ version: 'v1', auth: oAuth2Client });
    return gmailClient;
}

// Retrieve new emails from Gmail
async function fetchNewEmails({ gmailClient }) {
    const response = await gmailClient.users.messages.list({
        userId: 'me',
        q: 'is:unread', // Retrieve only unread emails
    });

    const emails = response.data.messages || [];
    return emails;
}


async function fetchUserDetails({ userId, access_token }) {
    try {
        const response = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/${userId}/profile`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const profile = response.data;
        console.log('User Profile:', profile);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

module.exports = {
    oAuth2Client,
    authUrl,
    googleOAuthHandler,
    createMailClient,
    fetchNewEmails,
    fetchUserDetails,
};