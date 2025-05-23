import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PRIVATE_B2_KEY_ID, PRIVATE_B2_APP_KEY } from '$env/static/private';
import { PUBLIC_B2_BUCKET, PUBLIC_B2_ENDPOINT, PUBLIC_B2_REGION } from '$env/static/public';

const s3Client = new S3Client({
    endpoint: PUBLIC_B2_ENDPOINT,
    region: PUBLIC_B2_REGION,
    credentials: {
        accessKeyId: PRIVATE_B2_KEY_ID,
        secretAccessKey: PRIVATE_B2_APP_KEY
    },
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
});

export async function generatePresignedUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: PUBLIC_B2_BUCKET,
        Key: key,
        ContentType: contentType
    });

    return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
}

export async function deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: PUBLIC_B2_BUCKET,
        Key: key
    });

    await s3Client.send(command);
}

export async function generateDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: PUBLIC_B2_BUCKET,
        Key: key
    });

    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function uploadProfilePicture(
    identifier: string, // Can be user ID or a unique ID from social provider
    body: Uint8Array,
    contentType: string,
    contentLength?: number
): Promise<string> {
    let fileExtension = contentType.split('/')[1];
    // Ensure a valid image extension or default to jpg
    if (!fileExtension || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension.toLowerCase())) {
        fileExtension = 'jpg';
    }
    const key = `avatars/${identifier}.${fileExtension}`;
    
    const command = new PutObjectCommand({
        Bucket: PUBLIC_B2_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        ...(contentLength && { ContentLength: contentLength }),
    });

    await s3Client.send(command);
    return key;
}

export async function uploadCoinIcon(
    coinSymbol: string,
    body: Uint8Array,
    contentType: string,
    contentLength?: number
): Promise<string> {
    let fileExtension = contentType.split('/')[1];
    if (!fileExtension || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension.toLowerCase())) {
        fileExtension = 'png';
    }
    const key = `coins/${coinSymbol.toLowerCase()}.${fileExtension}`;
    
    const command = new PutObjectCommand({
        Bucket: PUBLIC_B2_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        ...(contentLength && { ContentLength: contentLength }),
    });

    await s3Client.send(command);
    return key;
}

export { s3Client };