module.exports = {
    sanitizeNewLine: (html) => {
        if (!html) return html;
        const result = html.replace(/\r\n|\r|\n/g, '\\n');
        return result;
    }
};