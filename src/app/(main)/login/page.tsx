import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GoogleSignIn from "@/features/auth/google-signin";
import Link from "next/link";
import { Metadata } from "next";
import { PageBunner } from "@/components/navigation/page-bunner";

export const metadata: Metadata = {
  title: "ログイン ",
};

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function LoginPage(props: Props) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  const callbackURL = token ? `/accept-invite?token=${token}` : "/dashboard";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 lg:gap-8">
      <PageBunner
        title="管理者ログイン"
        description="管理者機能を利用するため、Googleアカウントでログインしてください。"
      />
      <div className="flex flex-col gap-4">
        <Card className="w-full border-main-200 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle>管理者ログイン</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <GoogleSignIn callbackURL={callbackURL} />
          </CardContent>
          <CardFooter>
            <p className="text-sm leading-6 text-slate-700">
              続行すると
              <Link href="/terms" className="text-main-900 underline">
                利用規約
              </Link>
              と
              <Link href="/policy" className="text-main-900 underline">
                プライバシーポリシー
              </Link>
              に同意したことになります。
            </p>
          </CardFooter>
        </Card>
        <div className="rounded-2xl border border-main-200 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm md:p-5 md:text-base">
          <p>
            ※Webアプリとしてインストール済みの方はアプリ内ブラウザでログインしてください。
          </p>
          <p className="mt-3">
            ※ゲストユーザーの方で間違えてログインしてしまった場合、ゲストユーザーのデータが削除されますのでご注意ください。
          </p>
        </div>
      </div>
    </div>
  );
}
