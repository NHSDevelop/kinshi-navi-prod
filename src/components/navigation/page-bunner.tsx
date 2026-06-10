type Props = {
  title: string;
};

export const PageBunner = ({ title }: Props) => {
  return (
    <section className="rounded-[1.75rem] border border-main-200 bg-main-50/70 p-5 md:p-7">
      <h1 className="text-2xl font-bold text-main-950 md:text-3xl">{title}</h1>
    </section>
  );
};
