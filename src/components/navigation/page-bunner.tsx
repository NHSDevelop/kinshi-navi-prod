import { Separator } from "../ui/separator";

type Props = {
  title: string;
};

export const PageBunner = ({ title }: Props) => {
  return (
    <section className="rounded-[1.75rem]">
      <h1 className="text-2xl font-bold text-main-950 md:text-3xl mb-4">
        {title}
      </h1>
      <Separator />
    </section>
  );
};
