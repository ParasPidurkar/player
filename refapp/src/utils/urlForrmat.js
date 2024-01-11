

export default class UrlFormat {
    static fromHttpToHttps(url) {
        if (location.protocol === 'https:' && new URL(url).protocol === 'http:') {
            url = url.replace('http', 'https');
            return url;
        }

        return url;
    }
}