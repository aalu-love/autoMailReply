const { google } = require('googleapis');
const readline = require('readline');

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
    scope: SCOPES,
});

console.log('Authorize this app by visiting this URL:');
console.log(authUrl);

// Create a readline interface to capture user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Prompt the user to enter the authorization code
rl.question('Enter the authorization code: ', async (code) => {
    try {
        // Exchange the authorization code for tokens
        const { tokens } = await oAuth2Client.getToken(code);
        const refreshToken = tokens.refresh_token;

        // Store the refresh token securely for future use
        // TODO: Implement your logic to store the refresh token securely

        console.log('Refresh token obtained successfully:', refreshToken);
    } catch (error) {
        console.error('Error while exchanging authorization code:', error.message);
    } finally {
        rl.close();
    }
});
