import Stream from 'stream';

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
