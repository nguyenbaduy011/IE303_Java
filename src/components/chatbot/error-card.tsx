import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export function ErrorCard({ message }: { message: string }) {
  return (
    <Card className="w-full max-w-md border-red-500">
      <CardHeader>
        <CardTitle className="text-red-500">Lỗi</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-500">{message}</p>
      </CardContent>
    </Card>
  );
}
