import * as Minio from 'minio';
import { randomUUID } from 'node:crypto';

export interface MinioConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
  publicUrl: string;
}

export const getMinioConfig = (): MinioConfig => {
  let runtimeConfig: Record<string, any> = {};
  try {
    runtimeConfig = useRuntimeConfig();
  } catch {
    // runtimeConfig not ready or in worker
  }

  const endpoint =
    process.env.MINIO_ENDPOINT ||
    (runtimeConfig.minioEndpoint as string) ||
    '127.0.0.1';

  const portRaw =
    process.env.MINIO_PORT ??
    runtimeConfig.minioPort ??
    9000;
  const port = typeof portRaw === 'string' ? parseInt(portRaw, 10) || 9000 : Number(portRaw);

  const sslRaw =
    process.env.MINIO_USE_SSL ??
    runtimeConfig.minioUseSsl ??
    false;
  const useSSL = sslRaw === true || sslRaw === 'true';

  const accessKey =
    process.env.MINIO_ACCESS_KEY ||
    (runtimeConfig.minioAccessKey as string) ||
    'minioadmin';

  const secretKey =
    process.env.MINIO_SECRET_KEY ||
    (runtimeConfig.minioSecretKey as string) ||
    'minioadmin';

  const bucket =
    process.env.MINIO_BUCKET ||
    (runtimeConfig.minioBucket as string) ||
    'pramuka';

  let publicUrl = (
    process.env.MINIO_PUBLIC_URL ||
    (runtimeConfig.minioPublicUrl as string) ||
    'https://s3.codexlab.my.id/pramuka'
  ).replace(/\/+$/, '');

  if (!publicUrl.endsWith(`/${bucket}`)) {
    publicUrl = `${publicUrl}/${bucket}`;
  }

  return {
    endpoint,
    port,
    useSSL,
    accessKey,
    secretKey,
    bucket,
    publicUrl,
  };
};

let clientInstance: Minio.Client | null = null;

export const getMinioClient = (): Minio.Client => {
  if (!clientInstance) {
    const config = getMinioConfig();
    clientInstance = new Minio.Client({
      endPoint: config.endpoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
  }
  return clientInstance;
};

export const client: Minio.Client = new Proxy({} as Minio.Client, {
  get(_target, prop, receiver) {
    const instance = getMinioClient();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

export async function uploadToMinio(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<{ url: string; key: string }> {
  const config = getMinioConfig();
  const minioClient = getMinioClient();

  // Sanitize filename and extract extension
  let ext = '';
  if (filename && filename.includes('.')) {
    const parts = filename.split('.');
    ext = parts[parts.length - 1].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }
  if (!ext) {
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') ext = 'jpg';
    else if (mimeType === 'image/png') ext = 'png';
    else if (mimeType === 'image/webp') ext = 'webp';
    else if (mimeType === 'image/gif') ext = 'gif';
    else if (mimeType === 'image/svg+xml') ext = 'svg';
    else ext = 'bin';
  }

  const key = 'uploads/' + Date.now() + '-' + randomUUID() + '.' + ext;

  await minioClient.putObject(config.bucket, key, buffer, buffer.length, {
    'Content-Type': mimeType,
  });

  return {
    url: config.publicUrl + '/' + key,
    key,
  };
}

export async function deleteFromMinio(urlOrKey: string): Promise<void> {
  if (!urlOrKey) return;

  const config = getMinioConfig();
  const minioClient = getMinioClient();

  let key = urlOrKey.trim();

  if (key.startsWith('/api/storage/')) {
    key = key.slice('/api/storage/'.length);
  }

  if (key.startsWith('http://') || key.startsWith('https://')) {
    const publicUrl = config.publicUrl.replace(/\/+$/, '');
    if (key.startsWith(publicUrl)) {
      key = key.slice(publicUrl.length);
    } else {
      try {
        const parsed = new URL(key);
        const pathname = parsed.pathname;
        const bucketPattern = `/${config.bucket}/`;
        const bucketIndex = pathname.indexOf(bucketPattern);
        if (bucketIndex !== -1) {
          key = pathname.slice(bucketIndex + bucketPattern.length);
        } else if (pathname.startsWith(`/${config.bucket}`)) {
          key = pathname.slice(`/${config.bucket}`.length);
        } else {
          key = pathname;
        }
      } catch {
        const bucketPattern = `/${config.bucket}/`;
        const bucketIndex = key.indexOf(bucketPattern);
        if (bucketIndex !== -1) {
          key = key.slice(bucketIndex + bucketPattern.length);
        }
      }
    }
  }

  if (key.includes('?')) {
    key = key.split('?')[0];
  }

  key = key.replace(/^\/+/, '');

  if (!key) return;

  await minioClient.removeObject(config.bucket, key);
}
