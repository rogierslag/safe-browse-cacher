import {describe, it} from 'mocha';
import assert from 'assert';
import verifyUrl from './verify';

describe('verifyUrl', () => {
	it('#shouldBlockASuspiciousUrl', async () => {
		const result = await verifyUrl('http://malware.testing.google.test/testing/malware/');
		assert.strictEqual(result, true);
	});
	it('#shouldNotBlockANonSuspiciousUrl', async () => {
		const result = await verifyUrl('https://google.com');
		assert.strictEqual(result, false);
	});
});
