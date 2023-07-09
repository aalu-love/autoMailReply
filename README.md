# AutoMailReply

AutoMailReply is a Node.js based app that automatically responds to emails sent to your Gmail mailbox while you’re away.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/aalu-love/AutoMailReply.git
   ```
2. Navigate to the project directory:

   ```bash
   cd AutoMailReply
   ```
3. Install the dependencies:

   ```bash
   npm install
   ```
4. Set up Google OAuth2 credentials:
    * Go to the Google Cloud Platform Console.
    * Create a new project or select an existing project.
    * Enable the Gmail API for your project.
    * Create OAuth2 credentials (Client ID and Client Secret).
    * Set the authorized redirect URI.
5. Configure the app:
    * Rename the .env.example file to .env.
    * Update the CLIENT_ID, CLIENT_SECRET, and REDIRECT_URI in the .env file with your OAuth2 credentials.

## Usage

1. Start the application:

    ```bash
    npm start
    ```
2. Open your web browser and navigate to the provided URL.
 
    ```bash
    http://localhost:3000/api/googleAuth
    ```
3. Authorize the app by signing in with your Google account.
4. Follow the instructions on the web page to set up automatic email replies.
 
    ```bash
    http://localhost:3000/api/replyAll
    ```
5. Enjoy your vacation while AutoMailReply handles your emails!


## License

This project is licensed under the MIT License.


