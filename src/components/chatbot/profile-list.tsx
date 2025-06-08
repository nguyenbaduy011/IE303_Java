"use client";

import type React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  UserIcon,
  UsersIcon,
  BuildingIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
} from "lucide-react";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type EmployeeCardProps = {
  employees: {
    information: {
      firstName: string;
      lastName: string;
      email: string;
      birthDate: string;
      gender: string;
      nationality: string;
      phoneNumber: string;
      hireDate: string;
      address: string;
      image_url?: string;
    };
    employmentDetail: {
      position: {
        name: string;
        description?: string;
      };
      department: {
        name: string;
        description?: string;
      };
      team: {
        name: string;
      };
      working_status: string;
    };
  }[];
  onProfileClick?: (employeeIndex: number) => void;
};

export default function EnhancedEmployeeListCard({
  employees,
  onProfileClick,
}: EmployeeCardProps) {
  const [expandedEmployee, setExpandedEmployee] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số nhân viên mỗi trang

  // Filter employees based on search term and status
  const filteredEmployees = employees.filter((employee) => {
    const fullName =
      `${employee.information.firstName} ${employee.information.lastName}`.toLowerCase();
    const position = employee.employmentDetail.position.name.toLowerCase();
    const department = employee.employmentDetail.department.name.toLowerCase();
    const team = employee.employmentDetail.team.name.toLowerCase();
    const searchMatch =
      searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) ||
      position.includes(searchTerm.toLowerCase()) ||
      department.includes(searchTerm.toLowerCase()) ||
      team.includes(searchTerm.toLowerCase());

    const statusMatch =
      filterStatus === "all" ||
      (filterStatus === "active" &&
        employee.employmentDetail.working_status === "active") ||
      (filterStatus === "inactive" &&
        employee.employmentDetail.working_status !== "active");

    return searchMatch && statusMatch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  const toggleExpand = (index: number) => {
    setExpandedEmployee(expandedEmployee === index ? null : index);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedEmployee(null); // Thu gọn tất cả khi chuyển trang
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-md border border-border bg-card">
      <CardHeader className="bg-primary text-primary-foreground p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary-foreground tracking-wide">
              Danh Sách Nhân Viên
            </h2>
            <p className="text-xs text-primary-100">
              Hiển thị: {filteredEmployees.length > 0 ? `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredEmployees.length)}` : "0"} / {filteredEmployees.length} nhân viên
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="text-xs bg-primary-700 text-primary-foreground border border-primary-500 rounded px-2 py-1"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "all" | "active" | "inactive")
              }
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang làm việc</option>
              <option value="inactive">Nghỉ việc</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-300" />
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên..."
            className="w-full bg-primary-1/2 text-primary-foreground border border-primary-500 rounded pl-8 pr-4 py-1.5 text-sm placeholder:text-primary-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Không tìm thấy nhân viên nào phù hợp với tiêu chí tìm kiếm</p>
          </div>
        ) : (
          <>
            {paginatedEmployees.map((employee, index) => {
              const fullName = `${employee.information.firstName} ${employee.information.lastName}`;
              const isActive =
                employee.employmentDetail.working_status === "active";
              const isExpanded = expandedEmployee === index;

              return (
                <div
                  key={index}
                  className="bg-card border border-border rounded-lg shadow-sm hover:shadow transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar and basic info */}
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
                          {employee.information.image_url && (
                            <AvatarImage
                              src={
                                employee.information.image_url ||
                                "/placeholder.svg"
                              }
                              alt={fullName}
                            />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {employee.information.firstName[0]}
                            {employee.information.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5">
                          {isActive ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-500 bg-card rounded-full border border-border" />
                          ) : (
                            <XCircleIcon className="h-4 w-4 text-red-500 bg-card rounded-full border border-border" />
                          )}
                        </div>
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-bold text-foreground truncate">
                            {fullName}
                          </h3>
                          <Badge
                            variant={isActive ? "default" : "destructive"}
                            className={`text-xs ${isActive ? "bg-primary text-primary-foreground" : ""}`}
                          >
                            {isActive ? "Đang làm việc" : "Nghỉ việc"}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">
                          {employee.employmentDetail.position.name} -{" "}
                          {employee.employmentDetail.department.name}
                        </p>

                        {/* Always visible info */}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <CompactInfoItem
                            icon={<PhoneIcon className="h-3 w-3" />}
                            label="SĐT"
                            value={employee.information.phoneNumber}
                            copyable
                          />
                          <CompactInfoItem
                            icon={<MailIcon className="h-3 w-3" />}
                            label="Email"
                            value={employee.information.email}
                            copyable
                          />
                        </div>

                        {/* Expandable section */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-t border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <CompactInfoItem
                                icon={<UserIcon className="h-3 w-3" />}
                                label="Giới tính"
                                value={
                                  employee.information.gender === "male"
                                    ? "Nam"
                                    : "Nữ"
                                }
                              />
                              <CompactInfoItem
                                icon={<CalendarIcon className="h-3 w-3" />}
                                label="Ngày sinh"
                                value={employee.information.birthDate}
                              />
                              <CompactInfoItem
                                icon={<BuildingIcon className="h-3 w-3" />}
                                label="Phòng ban"
                                value={employee.employmentDetail.department.name}
                              />
                              <CompactInfoItem
                                icon={<UsersIcon className="h-3 w-3" />}
                                label="Team"
                                value={employee.employmentDetail.team.name}
                              />
                              <CompactInfoItem
                                icon={<CalendarIcon className="h-3 w-3" />}
                                label="Ngày vào làm"
                                value={employee.information.hireDate}
                              />
                              <CompactInfoItem
                                icon={<MapPinIcon className="h-3 w-3" />}
                                label="Địa chỉ"
                                value={employee.information.address}
                              />
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-between mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(index)}
                            className="text-xs h-7 px-2 hover:bg-primary/5"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUpIcon className="h-3 w-3 mr-1" />
                                Thu gọn
                              </>
                            ) : (
                              <>
                                <ChevronDownIcon className="h-3 w-3 mr-1" />
                                Xem thêm
                              </>
                            )}
                          </Button>

                          {onProfileClick && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onProfileClick(index);
                              }}
                              className="text-xs h-7 border-primary/20 hover:bg-primary/5 hover:border-primary/40 cursor-pointer"
                              type="button"
                            >
                              Xem hồ sơ
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(i + 1);
                        }}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          handlePageChange(currentPage + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CompactInfoItem({
  icon,
  label,
  value,
  copyable = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const handleCopy = () => {
    if (copyable) {
      navigator.clipboard.writeText(value);
    }
  };

  return (
    <div className="flex items-center gap-2 group">
      <div className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-muted-foreground font-medium">
          {label}:{" "}
        </span>
        <span
          className={`text-xs text-foreground font-medium ${
            copyable
              ? "cursor-pointer hover:text-primary transition-colors"
              : ""
          }`}
          onClick={handleCopy}
          title={copyable ? "Click to copy" : undefined}
        >
          {value}
        </span>
      </div>
    </div>
  );
}