// https://gist.github.com/vlucas/2bd40f62d20c1d49237a109d491974eb
const crypto = require('crypto');


const IV_LENGTH = 16; // For AES, this is always 16


function encrypt(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ALICE_RUNTIME_ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
}


module.exports = {
    encrypt,
};
