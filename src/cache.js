const MAX_DATE = new Date(8640000000000000);

export default function createCache(maxSize) {
	const started = new Date().toISOString();
	const cache = new Map();
	let hits = 0;
	let misses = 0;

	// Throws the least recently used item from the cache
	function trimCache() {
		const itemToDelete = Array.from(cache.entries())
			.map(e => ({key : e[0], last_used_at : e[1].last_used_at}))
			.reduce((previousValue, currentValue) => {
				const isPreviousBeforeCurrent = currentValue.last_used_at - previousValue.last_used_at < 0;
				if (isPreviousBeforeCurrent) {
					return currentValue;
				}
				return previousValue;
			}, {last_used_at : MAX_DATE});

		console.log(`Will delete key ${itemToDelete.key} (last used at: ${itemToDelete.last_used_at.toISOString()})`);
		cache.delete(itemToDelete.key);
	}

	// Throws out all items over 1 days old
	function pruneCache() {
		console.log(`Starting cache pruning`);
		const threshold = new Date() - 24 * 60 * 60 * 1000;
		Array.from(cache.entries())
			.map(e => ({key : e[0], added_at : e[1].added_at}))
			.filter(e => e.added_at < threshold)
			.forEach(e => {
				console.log(`Will delete key ${e.key} (added at: ${e.added_at.toISOString()})`);
				cache.delete(e.key);
			});
	}

	setInterval(pruneCache, 60 * 60 * 1000);

	function getFromCache(cacheKey) {
		if (cacheKey === null) {
			return null;
		}
		if (Math.random() < 0.01) {
			console.log(`Cache clean started`);
			trimCache();
		}
		const cachedValue = cache.get(cacheKey);
		if (cachedValue) {
			hits++;
			cachedValue.last_used_at = new Date();
		} else {
			misses++;
		}

		return cachedValue || null;
	}

	function addToCache(cacheKey, isDangerous) {
		const cacheValue = {isDangerous, success : true, last_used_at : new Date(), added_at : new Date()};
		if (cacheKey === null) {
			return cacheValue
		}
		cache.set(cacheKey, cacheValue);

		if (cache.size >= maxSize) {
			console.log(`Cache clean required`);
			trimCache();
		}
		console.log(`Cache contains ${cache.size} items`);

		// Always return the set item, even if it may have been removed immediately
		return cacheValue;
	}

	function stats() {
		return {
			hits,
			misses,
			size : cache.size,
			maxSize,
			started
		}
	}

	return {
		getFromCache,
		addToCache,
		stats
	};
}
