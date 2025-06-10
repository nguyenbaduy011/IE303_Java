import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building,
  Hash,
  FileText,
  ChevronRight,
  Building2,
} from "lucide-react";
import Link from "next/link";

interface Department {
  id: string;
  name: string;
  description: string;
}

interface DepartmentListCardProps {
  departments: Department[];
}

export function DepartmentListCard({
  departments,
}: DepartmentListCardProps) {
  return (
    <Card className="w-full max-w-2xl shadow-lg border border-border bg-card pt-0 isolate">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
              <Building className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-primary-foreground">
                Danh sách phòng ban
              </CardTitle>
              <p className="text-xs text-primary-100">
                Tổng cộng: {departments.length} phòng ban
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-primary-foreground/20 text-primary-foreground border-0"
          >
            {departments.length} phòng ban
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {departments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Không có phòng ban nào
            </h3>
            <p className="text-sm text-muted-foreground">
              Hiện tại chưa có phòng ban nào được tạo.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {departments.map((department, index) => (
                <div
                  key={department.id}
                  className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-all duration-200 hover:border-primary/20"
                >
                  <div className="space-y-3">
                    {/* Department Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                          {department.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Hash className="h-3 w-3" />
                          <span>ID: {department.id}</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20"
                      >
                        Phòng ban #{index + 1}
                      </Badge>
                    </div>

                    {/* Department Description */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">
                          Mô tả:
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed pl-6 border-l-2 border-primary/20">
                        {department.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full hover:bg-primary/5 hover:border-primary/40"
                asChild
              >
                <Link href="/departments">
                  <Building className="mr-2 h-4 w-4" />
                  Xem chi tiết tất cả phòng ban
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
