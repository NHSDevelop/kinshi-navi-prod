import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const RESOLUTIONS = [640, 1024, 1600] as const;
const WEBP_QUALITY = 75;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFileData = formData.get("imageFileData");

    if (!(imageFileData instanceof File)) {
      return NextResponse.json(
        {
          message: "画像ファイルが見つかりません。",
        },
        { status: 400 },
      );
    }

    const imageFileDataArrayBuffer = await imageFileData.arrayBuffer();
    const imageFileDataBuffer = Buffer.from(imageFileDataArrayBuffer);

    // ファイル名の拡張子を除去
    const fileNameWithoutExt = imageFileData.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();
    const timestamp = Date.now();
    const baseFileName = `${timestamp}-${fileNameWithoutExt}`;

    const s3 = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_SECRET_KEY!,
      },
    });

    // 複数解像度で webp に変換
    const uploadedUrls: Array<{ width: number; url: string }> = [];
    const sharpInstance = sharp(imageFileDataBuffer).withMetadata();

    for (const width of RESOLUTIONS) {
      const webpBuffer = await sharpInstance
        .resize(width, width, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      const key = `images/${baseFileName}-${width}w.webp`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          ContentType: "image/webp",
          Body: webpBuffer,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );

      const url = `${process.env.R2_BUCKET_URL}/${key}`;
      uploadedUrls.push({ width, url });
    }

    // メイン URL（1024px）とsrcset を構築
    const mainUrl = uploadedUrls.find((u) => u.width === 1024)?.url;
    const srcset = uploadedUrls.map((u) => `${u.url} ${u.width}w`).join(", ");

    return NextResponse.json({
      message: "アップロードに成功しました。",
      url: mainUrl,
      srcset,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        message: "アップロードに失敗しました。",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
