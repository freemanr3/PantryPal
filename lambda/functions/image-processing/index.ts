import { S3Handler } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { Readable } from 'stream';
import * as AWSXRay from 'aws-xray-sdk-core';

const s3Client = AWSXRay.captureAWSv3Client(new S3Client({}));

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export const handler: S3Handler = async (event) => {
  AWSXRay.captureFunc('ImageProcessingHandler', async (subsegment) => {
    try {
      for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key);
        // Skip if this is already a processed image
        if (key.includes('/processed/')) continue;
        // Get the original image
        const getObjectResponse = await s3Client.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: key
          })
        );
        const imageBuffer = await streamToBuffer(getObjectResponse.Body as Readable);
        // Process image variants
        const [thumbnail, medium, large] = await Promise.all([
          sharp(imageBuffer)
            .resize(200, 200, { fit: 'cover' })
            .webp({ quality: 80 })
            .toBuffer(),
          sharp(imageBuffer)
            .resize(600, 600, { fit: 'inside' })
            .webp({ quality: 80 })
            .toBuffer(),
          sharp(imageBuffer)
            .resize(1200, 1200, { fit: 'inside' })
            .webp({ quality: 80 })
            .toBuffer()
        ]);
        // Generate new keys for processed images
        const basePath = key.split('/').slice(0, -1).join('/');
        const filename = key.split('/').pop()?.split('.')[0];
        // Upload processed variants
        await Promise.all([
          s3Client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: `${basePath}/processed/${filename}_thumb.webp`,
            Body: thumbnail,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000'
          })),
          s3Client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: `${basePath}/processed/${filename}_medium.webp`,
            Body: medium,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000'
          })),
          s3Client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: `${basePath}/processed/${filename}_large.webp`,
            Body: large,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000'
          }))
        ]);
        console.log(`Successfully processed image: ${key}`);
      }
    } catch (error) {
      console.error('Image processing error:', error);
      subsegment?.addError(error as Error);
      throw error;
    } finally {
      subsegment?.close();
    }
  });
}; 