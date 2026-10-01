import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 (S3-compatible): proof screenshots + chat attachments.
// Admins can read a file only once its trade is disputed (checked in Ops).
@Injectable()
export class StorageService {
  private s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  });
  private bucket = process.env.R2_BUCKET || 'trex-proofs';

  uploadUrl(key: string, contentType: string) {
    const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    return getSignedUrl(this.s3, cmd, { expiresIn: 600 });
  }
}
