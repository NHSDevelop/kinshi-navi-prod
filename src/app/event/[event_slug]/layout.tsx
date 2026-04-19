import Link from "next/link";
import { AiOutlineUser } from "react-icons/ai";
import { redirect } from "next/navigation";
import { getEventBySlug } from "@/features/event/action";

type Props = {
  children: React.ReactNode;
  params: Promise<{ event_slug: string }>;
};

export default async function EventLayout({ children, params }: Props) {
  const { event_slug } = await params;
  const event = await getEventBySlug(event_slug);

  if (!event) {
    redirect("/");
  }

  return (
    <>
      <header className="border-b-2 w-full flex h-20 items-center px-4 sm:px-6 lg:px-8 justify-between bg-main-400">
        <Link
          href={`/event/${event_slug}`}
          className="text-lg md:text-xl  font-bold"
        >
          {event.name} | Gakusai Hub
        </Link>
        <Link
          href={`/event/${event_slug}/anonymous-user`}
          className="bg-gray-50 border border-gray-950 rounded-full w-8 h-8 flex items-center justify-center"
        >
          <AiOutlineUser />
        </Link>
      </header>
      <main className="px-4 md:px-16 lg:px-40 xl:px-60 flex-1 py-4 lg:py-8">
        {children}
      </main>
    </>
  );
}
