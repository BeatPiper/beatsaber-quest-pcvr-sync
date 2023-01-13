import Stream from 'stream';
import { WriteStream } from 'fs';

export function streamToString(stream: Stream): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('error', err => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

export function stringToStream(input: string): Stream.Readable {
  const stream = new Stream.Readable();
  stream.push(input);
  stream.push(null);
  return stream;
}

export function streamToWriteStream(stream: Stream, writeStream: WriteStream) {
  stream.pipe(writeStream);
  return new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
}
