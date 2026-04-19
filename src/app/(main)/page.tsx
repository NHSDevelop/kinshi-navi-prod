import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { SystemInfoList } from "@/features/system-info/list";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 ">
      <div className="min-h-60 h-auto w-full flex flex-col justify-center mx-4">
        <h1 className=" text-4xl sm:text-6xl lg:text-8xl font-bold">
          Gakusai Hub
        </h1>
        <h2 className="text-lg md:text-xl mt-8">
          あなたの文化祭をより楽しく、より便利に。
          告知・案内から、チケット・レジまで、 スマホやタブレットだけで完結。
        </h2>
        <h2 className="text-lg md:text-xl mt-8">
          Gakusai
          Hubは、学校の文化祭向けの総合Webサービスです。インストール不要で、教育機関なら無料で利用可能です。
        </h2>
      </div>
      <div className="hidden md:flex gap-4 mx-4">
        <Button asChild variant="card" className="h-12">
          <Link href="/event-list">開催中のイベントを探す</Link>
        </Button>
        <Button asChild variant="card" className="h-12">
          <Link href="/application-form">利用申込みはこちら</Link>
        </Button>
      </div>
      <div className="flex flex-col gap-4 md:hidden mx-4">
        <Button asChild variant="card" className="h-12">
          <Link href="/event-list">開催中のイベントを探す</Link>
        </Button>
        <Button asChild variant="card" className="h-12">
          <Link href="/application-form">利用申込みはこちら</Link>
        </Button>
      </div>
      <Separator />
      <div className="min-h-40 h-auto w-full flex flex-col gap-4 md:gap-8 justify-center mx-4">
        <p className="text-xl sm:text-3xl">お知らせ</p>
        <SystemInfoList />
      </div>
      <Separator />

      <div className="min-h-80 h-auto w-full  flex flex-col gap-4 md:gap-8 mx-4 ">
        <p className="text-xl sm:text-3xl">サービス一覧</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          <Card className="max-w-80">
            <CardHeader>
              <CardTitle>チケット機能</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                端末から企画等の電子チケットの発行・管理が可能。
              </p>
              <div className="flex">
                <p>詳しくは</p>
                <Link
                  href="/help/ticket"
                  className="text-sky-500 hover:underline"
                >
                  こちら
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card className="max-w-80">
            <CardHeader>
              <CardTitle>レジ機能</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                販売でのレジを行うことが可能。在庫管理機能との連携も。
              </p>
              <div className="flex">
                <p>詳しくは</p>
                <Link
                  href="/help/register"
                  className="text-sky-500 hover:underline"
                >
                  こちら
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card className="max-w-80">
            <CardHeader>
              <CardTitle>在庫管理機能</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">販売する商品の在庫を管理することが可能。</p>
              <div className="flex">
                <p>詳しくは</p>
                <Link
                  href="/help/inventory"
                  className="text-sky-500 hover:underline"
                >
                  こちら
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card className="max-w-80">
            <CardHeader>
              <CardTitle>人員管理機能</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">文化祭内の店舗やスタッフを管理可能。</p>
              <div className="flex">
                <p>詳しくは</p>
                <Link
                  href="/help/management"
                  className="text-sky-500 hover:underline"
                >
                  こちら
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Separator />
      <div className="min-h-80 h-auto w-full flex flex-col gap-4 md:gap-8 mx-4">
        <p className="text-xl sm:text-3xl">料金体系（1組織あたり）</p>
        <div className="flex flex-col gap-4 mt-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Freeプラン</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold mb-4">￥0/月</p>
              <ul className="flex flex-col mb-4">
                <li>最大3つのイベント</li>
                <li>最大30個の店舗</li>
              </ul>
              <div className="flex">
                <p>詳しくは</p>
                <Link href="#" className="text-sky-500 hover:underline">
                  こちら
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />
    </div>
  );
}
