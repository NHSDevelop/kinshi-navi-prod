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

export const metadata: Metadata = {
  title: "サインイン | Kinshi Navi",
};

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function SignInPage(props: Props) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  const callbackURL = token ? `/accept-invite?token=${token}` : "/dashboard";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 lg:gap-8">
      <section className="rounded-[1.75rem] border border-main-200 bg-main-50/70 p-5 md:p-7">
        <h1 className="text-2xl font-bold text-main-950 md:text-3xl">
          管理者サインイン
        </h1>
        <p className="mt-3 text-sm leading-6 text-main-900/80 md:text-base">
          管理者機能を利用するため、Googleアカウントでサインインしてください。
        </p>
      </section>
      <div className="flex flex-col gap-4">
        <Card className="w-full border-main-200 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle>管理者サインイン</CardTitle>
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
            ※Webアプリとしてインストール済みの方はアプリ内ブラウザでサインインしてください。
          </p>
          <p className="mt-3">
            ※ゲストユーザーの方で間違えてサインインしてしまった場合、ゲストユーザーのデータが削除されますのでご注意ください。
          </p>
        </div>
      </div>
    </div>
  );
}
