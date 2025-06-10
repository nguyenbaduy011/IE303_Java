import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Hash,
  FileText,
  ChevronRight,
  Key,
  Users,
  Calendar,
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface RoleListCardProps {
  roles: Role[];
}

export function RoleListCard({ roles }: RoleListCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card className="w-full max-w-3xl shadow-lg border border-border bg-card pt-0 isolate">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-primary-foreground">
                Danh sách vai trò
              </CardTitle>
              <p className="text-xs text-primary-100">
                Tổng cộng: {roles.length} vai trò
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-primary-foreground/20 text-primary-foreground border-0"
          >
            {roles.length} vai trò
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {roles.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Không có vai trò nào</h3>
            <p className="text-sm text-muted-foreground">
              Hiện tại chưa có vai trò nào được tạo.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-6 max-h-96 overflow-y-auto">
              {roles.map((role, index) => (
                <div
                  key={role.id}
                  className="p-5 rounded-lg border border-border bg-card hover:shadow-md transition-all duration-200 hover:border-primary/20"
                >
                  <div className="space-y-4">
                    {/* Role Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-primary flex-shrink-0" />
                          {role.name}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            <span>ID: {role.id}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Tạo: {formatDate(role.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20"
                      >
                        Vai trò #{index + 1}
                      </Badge>
                    </div>

                    {/* Role Description */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">
                          Mô tả:
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed pl-6 border-l-2 border-primary/20">
                        {role.description}
                      </p>
                    </div>

                    {/* Permissions Section */}
                    {role.permissions.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">
                              Quyền hạn ({role.permissions.length})
                            </span>
                          </div>
                          <div className="grid gap-2 pl-6">
                            {role.permissions.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-start gap-3 p-2 rounded-md bg-accent/30 border border-accent/50"
                              >
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">
                                    {permission.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full hover:bg-primary/5 hover:border-primary/40"
              >
                <Shield className="mr-2 h-4 w-4" />
                Quản lý vai trò và quyền hạn
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
