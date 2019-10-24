const taglib = require('taglib2');

process.on('message', message => {
    try {
        const { filePath, options } = message;
        taglib.writeTagsSync(filePath, options);
        sendReply(null, 'Completed');
        close();
    } catch (e) {
        console.error('[metadata] Error', e);
        sendReply(e, e.message);
    }
});

const sendReply = (error, message) => {
    process.send({ error, message });
}

const close = () => {
    setTimeout(() => {
        console.log('[metadata] 再見!');
        process.exit();
    }, 1000);
};