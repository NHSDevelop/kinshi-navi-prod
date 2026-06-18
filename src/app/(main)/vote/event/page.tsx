import { PageBunner } from "@/components/navigation/page-bunner";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "イベントの投票",
};

export const dynamic = "force-dynamic";

export default function FoodVotePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:gap-8">
      <PageBunner title="イベント等の投票" />
      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6 flex flex-col gap-4">
        <p>
          リンク先のフォームは投票時間になるまでアクセスが制限されます。ご了承ください。
        </p>
        <Button asChild>
          <Link href="https://drive.google.com/open?id=1Sy_DPk17Nq6vssJJI-IhLIHDL2njKUD4lHJleP_J2ik">
            N-1投票フォーム
          </Link>
        </Button>
        <Button asChild>
          <Link href="https://drive.google.com/open?id=1m_vy5godSsUeZ-aII1eUlhtDr9TpRRY5NG9FAvHY7PQ">
            ユニコン（1年）投票フォーム
          </Link>
        </Button>
        <Button asChild>
          <Link href="https://drive.google.com/open?id=1fXPhBnpfBq9jjoD3yl3kc0DGyg_8IhpO75Nc8daIKO8">
            ユニコン（2年）投票フォーム
          </Link>
        </Button>
        <Button asChild>
          <Link href="https://drive.google.com/open?id=1S2F7iSH7s0DM56GWqXxqkFTKdI-C-Ym_BzSfj7QNXo8">
            ユニコン（3年）投票フォーム
          </Link>
        </Button>
        <Button asChild>
          <Link href="https://drive.google.com/open?id=1qFW7amHhzoM9ssQZ45V-fdgzWr2Yp9ztiKXSXUD_PJY">
            ユニコン（決勝）投票フォーム
          </Link>
        </Button>
      </section>
    </div>
  );
}
