const express = require('express');
const mailController = require('../controllers/mailController');

const router = express.Router();

// Mail Routes
router.get('/googleAuth', (req, res) => {
    try {
        const url = mailController.authorizationURL;
        res.send(`<a href=${url}>Google Auth</a>`);
    } catch (err) {
        console.log(`Error: ${err}`);
        res.json({ error: err });
    }

});

router.get('/oauth2callback', async (req, res) => {
    try {
        const code = req.query.code;
        await mailController.getGoogleOAuthTokens({ code });
        res.send(`<a href="/api/replyAll">Reply to All</a>`);
    } catch (e) {
        console.log(`Error: ${e}`);
        res.json({ error: `${e}`, code: 500 });
    }

});

router.get('/replyAll', async (req, res) => {
    try {
        await mailController.executeEmailProcessing();
        res.send('Auto reply is on process...');
    } catch (err) {
        console.log(`${err}`);
        res.json({
            error: `${err}`,
            code: 500
        });
    }
});

module.exports = router;