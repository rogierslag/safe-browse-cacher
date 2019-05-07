import fetch from 'node-fetch';

const BASE_URL = 'https://safebrowsing.googleapis.com/v4/threatMatches:find?key={key}';
const API_KEY = process.env.API_KEY;

const HTTP_TIMEOUT = Number(process.env.HTTP_TIMEOUT) || 2000;

const options = {
	clientId : 'safe-browse-cacher',
	clientVersion : '1.0.0'
};

export default async function verifyUrl(url) {
	const urls = [{url}];
	const body = {
		client : {
			clientId : options.clientId,
			clientVersion : options.clientVersion
		},
		threatInfo : {
			threatTypes : ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION", "THREAT_TYPE_UNSPECIFIED"],
			platformTypes : ["ANY_PLATFORM"],
			threatEntryTypes : ["URL"],
			threatEntries : urls,
		}
	};

	return await fetch(BASE_URL.replace('{key}', API_KEY), {
		method : 'post',
		body : JSON.stringify(body),
		headers : {
			'Content-Type' : 'application/json',
			'Accept' : 'application/json',
		},
		timeout : HTTP_TIMEOUT,
	})
		.then(body => body.ok)
		.then(body => body.json())
		.then(body => {
			const matchingUrls = body.matches ? body.matches.map(m => m.threat.url) : [];
			return matchingUrls.reduce((previousValue, currentValue) => previousValue || currentValue === url, false);
		})
		.catch(x => undefined);
}
