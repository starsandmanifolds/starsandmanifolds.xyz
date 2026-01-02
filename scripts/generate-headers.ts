import { writeFileSync } from 'fs';
import { generateHeadersFile } from '../src/lib/headers.ts';

writeFileSync('_headers', generateHeadersFile());
console.log('Generated _headers');
