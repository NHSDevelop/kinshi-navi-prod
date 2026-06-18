import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  canUseManagementActions,
  getAuthenticatedUser,
} from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";

const RESOLUTIONS = [640, 1024, 1600] as const;

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.isAnonymous) {
      return NextResponse.json(
        { message: "ログインが必要です。" },
        { status: 401 },
      );
    }

    if (!(await canUseManagementActions(user.id))) {
      return NextResponse.json(
        { message: "権限がありません。" },
        { status: 403 },
      );
    }

    const formData = await req.formData();
    const originalName = (formData.get("originalName") as string) || "image";

    const fileNameWithoutExt = originalName
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

    const uploadedUrls: Array<{ width: number; url: string }> = [];

    // クライアントから送信された各解像度のファイルを取り出してそのままR2に保存
    for (const width of RESOLUTIONS) {
      const fileData = formData.get(`image_${width}`);

      if (!(fileData instanceof File)) {
        return NextResponse.json(
          { message: "画像データが不完全です。" },
          { status: 400 },
        );
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer); // Cloudflare Workers環境ではBufferではなくUint8Arrayを使用

      const key = `images/${baseFileName}-${width}w.webp`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          ContentType: "image/webp",
          Body: buffer,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );

      const url = `${process.env.R2_BUCKET_URL}/${key}`;
      uploadedUrls.push({ width, url });
    }

    const mainUrl = uploadedUrls.find((u) => u.width === 1024)?.url;
    const srcset = uploadedUrls.map((u) => `${u.url} ${u.width}w`).join(", ");

    return NextResponse.json({
      message: "アップロードに成功しました。",
      url: mainUrl,
      srcset,
    });
  } catch (error: unknown) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { message: "アップロードに失敗しました。" },
      { status: 500 },
    );
  }
}
