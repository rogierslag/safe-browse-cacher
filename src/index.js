import express from 'express';
import verifyUrl from './verify';

import cacheSetup from './cache';

const cache = cacheSetup(10000);

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
	console.error(`No proper API has been set`);
	// eslint-disable-next-line
	process.exit(1);
}

const UNABLE_TO_VALIDATE_RESPONSE = {success : false};

const app = express();
app.get('/verify', async (req, res) => {
	const url = req.query.url;
	let cachedValue = cache.getFromCache(url);
	if (cachedValue) {
		res.json(cachedValue);
		return;
	}

	try {
		const isDangerous = await verifyUrl(url);
		if (isDangerous === undefined) {
			// Error occurred, could not verify
			res.status(500).json(UNABLE_TO_VALIDATE_RESPONSE);
			return;
		}
		cachedValue = cache.addToCache(url, isDangerous);
		res.status(200).json(cachedValue);
	} catch (e) {
		console.error(`Got an error`, e);
		res.json(UNABLE_TO_VALIDATE_RESPONSE);
	}
});
app.get('/_health', (req, res) => res.end('Ready to ensure safety'));
app.listen(3000, () => console.log('Server is listening'));
