import { TextEncoder } from 'util';
import fetch from 'cross-fetch';

if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder;
}
if (typeof global.fetch === 'undefined') {
    global.fetch = fetch;
}
