import { Card, CardContent } from "../ui/card";

type notFoundProps = {
  context: string;
};

export const NotFoundPrompt = ({ context }: notFoundProps) => {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="text-muted-foreground">{context}が存在しません。</p>
      </CardContent>
    </Card>
  );
};
