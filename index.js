const express = require('express');
const {simpleParser} = require('mailparser');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));

app.get('/ping', (req, res) => {
    res.send('pong');
});

app.post('/parseEmail', async (req, res) => {
    const {body} = req.body;

    if (!body) {
        return res.status(400).json({error: 'Raw email body is required.'});
    }

    try {
        const parsedEmail = await simpleParser(body);

        const responseData = {
            from: parsedEmail.from?.value[0]?.address || null,
            sender: parsedEmail.sender?.address || null,
            to: parsedEmail.to?.text || null,
            subject: parsedEmail.subject || null,
            text: parsedEmail.text || null,
            date: parsedEmail.date || null,
            textAsHtml: parsedEmail.textAsHtml || null,
            attachments: parsedEmail.attachments.map(att => ({
                filename: att.filename,
                contentType: att.contentType,
                contentDisposition: att.contentDisposition,
                size: att.size,
                content: att.content.toString('base64')
            })),
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error parsing email:', error);
        res.status(500).json({error: 'Failed to parse email.'});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});