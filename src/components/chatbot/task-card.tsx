import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export function TaskCard({
    name,
    description,
    deadline,
    assigned_to,
    status,
  }: {
   name: string,
   description: string,
   deadline: string,
   assigned_to: string,
   status: string
  }) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Mô tả:</strong> {description}</p>
            <p><strong>Thời hạn:</strong> {deadline}</p>
            <p><strong>Người được giao:</strong> {assigned_to}</p>
            <p><strong>Trạng thái:</strong> {status}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  