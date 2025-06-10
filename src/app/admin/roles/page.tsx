"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  fetchRolePermissions,
  PermissionType,
} from "@/app/api/get-all-permissions/route";
import {
  fetchRoles,
  RoleWithPermissionsType,
} from "@/app/api/get-all-roles/route";
import { createRole } from "@/app/api/create-role/route";
import { updateRole } from "@/app/api/update-role/route";
import { toast } from "sonner";
import { deleteRole } from "@/app/api/delete-role/route";
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialog,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleWithPermissionsType[]>([]);
  const [permissions, setPermissions] = useState<PermissionType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isCreatePermissionOpen, setIsCreatePermissionOpen] = useState(false);
  const [isDeleteRoleOpen, setIsDeleteRoleOpen] = useState(false);
  const [currentRole, setCurrentRole] =
    useState<RoleWithPermissionsType | null>(null);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });
  const [newPermission, setNewPermission] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch roles and permissions on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch roles
        const rolesResponse = await fetch(
          "http://localhost:8080/api/role/all",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!rolesResponse.ok) {
          if (rolesResponse.status === 401)
            throw new Error("Session expired. Please log in again.");
          if (rolesResponse.status === 403)
            throw new Error(
              "You do not have permission to view this information."
            );
          if (rolesResponse.status === 404) throw new Error("Roles not found.");
          throw new Error(
            `HTTP ${rolesResponse.status}: Failed to fetch roles`
          );
        }
        const rolesData = await rolesResponse.json();
        setRoles(Array.isArray(rolesData) ? rolesData : []);

        // Fetch permissions
        const permissionsData = await fetchRolePermissions();
        setPermissions(permissionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // lọc role trên thanh tìm kiếm
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // lọc permission trên thanh tìm kiếm
  const filteredPermissions = permissions.filter(
    (permission) =>
      permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch roles
      const rolesResponse = await fetchRoles();
      const rolesData = await rolesResponse.json();
      if (rolesResponse.status !== 200) {
        throw new Error(rolesData.message || "Failed to fetch roles");
      }
      setRoles(Array.isArray(rolesData) ? rolesData : []);

      // Fetch permissions
      const permissionsData = await fetchRolePermissions();
      setPermissions(permissionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Lấy role và permission mỗi khi mount
  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRole = async () => {
    try {
      await createRole({
        name: newRole.name,
        description: newRole.description,
        permissionIds: newRole.permissions,
      });

      // Gọi lại loadData để fetch danh sách roles mới
      toast.success("Role created successfully!");
      await loadData();

      setNewRole({ name: "", description: "", permissions: [] });
      setIsCreateRoleOpen(false);
    } catch (error) {
      toast.error("Failed to create role");
      setError(
        error instanceof Error ? error.message : "Failed to create role"
      );
    }
  };

  // Xử lý cập nhật role
  const handleUpdateRole = async () => {
    if (currentRole) {
      try {
        await updateRole({
          roleId: currentRole.id,
          name: currentRole.name,
          description: currentRole.description,
          permissionIds: currentRole.permissions.map((p) => p.id),
        });
        toast.success("Role updated successfully!");
        // Gọi lại loadData để cập nhật danh sách roles
        await loadData();

        setIsEditRoleOpen(false);
      } catch (error) {
        toast.error("Failed to update role");
        setError(
          error instanceof Error ? error.message : "Failed to update role"
        );
      }
    }
  };

  // Xử lý xoá role
  const handleDeleteRole = async () => {
    if (currentRole) {
      try {
        await deleteRole(currentRole.id);
        toast.success("Role deleted successfully!");
        await loadData();
        setIsDeleteRoleOpen(false);
      } catch (error) {
        toast.error("Failed to delete role");
        setError(
          error instanceof Error ? error.message : "Failed to delete role"
        );
      }
    }
  };

  // Xử lý toggle permission của từng role
  const handlePermissionToggle = (
    roleId: string,
    permissionId: string,
    isChecked: boolean
  ) => {
    if (currentRole && currentRole.id === roleId) {
      const updatedPermissionIds = isChecked
        ? [...currentRole.permissions.map((p) => p.id), permissionId]
        : currentRole.permissions
            .map((p) => p.id)
            .filter((id) => id !== permissionId);

      const updatedPermissions = updatedPermissionIds
        .map((id) => permissions.find((p) => p.id === id))
        .filter((p): p is PermissionType => p !== undefined);

      setCurrentRole({
        ...currentRole,
        permissions: updatedPermissions,
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {loading && (
        <Alert>
          <AlertDescription>Loading roles and permissions...</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage roles and permissions for your organization
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setIsCreatePermissionOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Permission</span>
          </Button>
          <Button
            onClick={() => setIsCreateRoleOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Role</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredRoles.length === 0 && !loading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <p className="text-muted-foreground">No roles found</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setIsCreateRoleOpen(true);
                  }}
                >
                  Create a new role
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoles.map((role) => (
                <Card key={role.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{role.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {role.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentRole(role);
                            setIsEditRoleOpen(true);
                          }}
                          disabled={role.name === "SUPER_ADMIN"}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        {role.name !== "SUPER_ADMIN" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCurrentRole(role);
                              setIsDeleteRoleOpen(true);
                            }}
                          >
                            {role.name !== "SUPER_ADMIN" && (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Permissions ({role.permissions.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {role.permissions.slice(0, 5).map((permission) => (
                          <Badge
                            key={permission.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {permission.name}
                          </Badge>
                        ))}
                        {role.permissions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-1 border-t bg-muted/50 flex justify-between">
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(role.created_at).toLocaleDateString()}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm">
            <div className="grid grid-cols-12 p-4 border-b font-medium text-sm">
              <div className="col-span-5">Permission Name</div>
              <div className="col-span-6">Description</div>
              <div className="col-span-1">Actions</div>
            </div>
            <div className="divide-y">
              {filteredPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="grid grid-cols-12 p-4 text-sm items-center"
                >
                  <div className="col-span-5 font-medium">
                    {permission.name}
                  </div>
                  <div className="col-span-6 text-muted-foreground">
                    {permission.description}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Add a new role with specific permissions. Roles define what users
              can do in the system.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                placeholder="e.g., Content Editor"
                value={newRole.name}
                onChange={(e) =>
                  setNewRole({ ...newRole, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                placeholder="Describe what this role is responsible for..."
                value={newRole.description}
                onChange={(e) =>
                  setNewRole({ ...newRole, description: e.target.value })
                }
              />
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label>Permissions</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Select the permissions this role should have
              </p>

              <ScrollArea className="h-[300px] pr-4">
                <div className="mb-6">
                  <div className="font-medium mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Permissions
                  </div>
                  <div className="ml-6 space-y-2">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-start space-x-2"
                      >
                        <Checkbox
                          id={`new-${permission.id}`}
                          checked={newRole.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewRole({
                                ...newRole,
                                permissions: [
                                  ...newRole.permissions,
                                  permission.id,
                                ],
                              });
                            } else {
                              setNewRole({
                                ...newRole,
                                permissions: newRole.permissions.filter(
                                  (id) => id !== permission.id
                                ),
                              });
                            }
                          }}
                        />
                        <div className="grid gap-0.5 leading-none">
                          <Label
                            htmlFor={`new-${permission.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {permission.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateRoleOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={!newRole.name}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role: {currentRole?.name}</DialogTitle>
            <DialogDescription>
              Modify role details and permissions
            </DialogDescription>
          </DialogHeader>

          {currentRole && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-role-name">Role Name</Label>
                <Input
                  id="edit-role-name"
                  value={currentRole.name}
                  onChange={(e) =>
                    setCurrentRole({ ...currentRole, name: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-role-description">Description</Label>
                <Textarea
                  id="edit-role-description"
                  value={currentRole.description}
                  onChange={(e) =>
                    setCurrentRole({
                      ...currentRole,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Permissions</Label>
                  <div className="text-sm text-muted-foreground">
                    {currentRole.permissions.length} selected
                  </div>
                </div>

                <ScrollArea className="h-[300px] pr-4">
                  <div className="mb-6">
                    <div className="font-medium mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Permissions
                    </div>
                    <div className="ml-6 space-y-2">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start space-x-2"
                        >
                          <Checkbox
                            id={`edit-${permission.id}`}
                            checked={currentRole.permissions.some(
                              (p) => p.id === permission.id
                            )}
                            onCheckedChange={(checked) =>
                              handlePermissionToggle(
                                currentRole.id,
                                permission.id,
                                !!checked
                              )
                            }
                          />
                          <div className="grid gap-0.5 leading-none">
                            <Label
                              htmlFor={`edit-${permission.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {permission.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={!currentRole?.name}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Permission Dialog */}
      <Dialog
        open={isCreatePermissionOpen}
        onOpenChange={setIsCreatePermissionOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Permission</DialogTitle>
            <DialogDescription>
              Add a new permission that can be assigned to roles
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="permission-name">Permission Name</Label>
              <Input
                id="permission-name"
                placeholder="e.g., Create Articles"
                value={newPermission.name}
                onChange={(e) =>
                  setNewPermission({ ...newPermission, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="permission-description">Description</Label>
              <Textarea
                id="permission-description"
                placeholder="Describe what this permission allows..."
                value={newPermission.description}
                onChange={(e) =>
                  setNewPermission({
                    ...newPermission,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreatePermissionOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={!newPermission.name}>Create Permission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteRoleOpen} onOpenChange={setIsDeleteRoleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {currentRole && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                Deleting the role &quot;{currentRole.name}&quot; will remove it
                from all users who currently have this role assigned.
              </AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
