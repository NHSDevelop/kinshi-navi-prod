type Props = {
  title: string;
  description?: string;
};

export const PageBunner = ({ title, description }: Props) => {
  return (
    <section className="rounded-[1.75rem] border border-main-200 bg-main-50/70 p-5 md:p-7">
      <h1 className="text-2xl font-bold text-main-950 md:text-3xl">{title}</h1>
      {description && (
        <p className="mt-3 text-sm leading-6 text-main-900/80 md:text-base">
          {description}
        </p>
      )}
    </section>
  );
};
