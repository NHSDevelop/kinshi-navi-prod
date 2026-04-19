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
  title: "サインイン | Gakusai Hub",
};

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function SignInPage(props: Props) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  const callbackURL = token ? `/accept-invite?token=${token}` : "/dashboard";
  return (
    <div className="flex flex-col items-center justify-center ">
      <div className="flex flex-col items-start mt-4 gap-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>管理者サインイン</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <GoogleSignIn callbackURL={callbackURL} />
          </CardContent>
          <CardFooter>
            <p>
              続行すると
              <Link href="/terms" className="text-indigo-900 underline">
                利用規約
              </Link>
              と
              <Link href="/policy" className="text-indigo-900 underline">
                プライバシーポリシー
              </Link>
              に同意したことになります。
            </p>
          </CardFooter>
        </Card>
        <div className="flex flex-col gap-4 mx-2">
          <p className="text-sm md:text-base">
            ※Webアプリとしてインストール済みの方はアプリ内ブラウザでサインインしてください。
          </p>
          <p className="text-sm md:text-base">
            ※ゲストユーザーの方で間違えてサインインしてしまった場合、ゲストユーザーのデータが削除されますのでご注意ください。
          </p>
        </div>
      </div>
    </div>
  );
}
