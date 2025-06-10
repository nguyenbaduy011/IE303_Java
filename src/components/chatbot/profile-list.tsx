"use client";

import type React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  FilterIcon,
  DownloadIcon,
  SlidersHorizontal,
  UserCircle,
  Briefcase,
  Clock,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState<
    "name" | "position" | "department" | "hireDate"
  >("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

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

  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case "name":
        valueA = `${a.information.firstName} ${a.information.lastName}`;
        valueB = `${b.information.firstName} ${b.information.lastName}`;
        break;
      case "position":
        valueA = a.employmentDetail.position.name;
        valueB = b.employmentDetail.position.name;
        break;
      case "department":
        valueA = a.employmentDetail.department.name;
        valueB = b.employmentDetail.department.name;
        break;
      case "hireDate":
        valueA = new Date(a.information.hireDate).getTime();
        valueB = new Date(b.information.hireDate).getTime();
        break;
      default:
        valueA = `${a.information.firstName} ${a.information.lastName}`;
        valueB = `${b.information.firstName} ${b.information.lastName}`;
    }

    if (sortDirection === "asc") {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = sortedEmployees.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, itemsPerPage, sortBy, sortDirection]);

  const toggleExpand = (index: number) => {
    setExpandedEmployee(expandedEmployee === index ? null : index);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedEmployee(null); // Thu gọn tất cả khi chuyển trang
  };

  // Toggle sort direction
  const handleSort = (
    newSortBy: "name" | "position" | "department" | "hireDate"
  ) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortDirection("asc");
    }
  };

  // Toggle employee selection
  const toggleSelectEmployee = (index: number) => {
    if (selectedEmployees.includes(index)) {
      setSelectedEmployees(selectedEmployees.filter((i) => i !== index));
    } else {
      setSelectedEmployees([...selectedEmployees, index]);
    }
  };

  // Toggle select all employees
  const toggleSelectAll = () => {
    if (selectedEmployees.length === paginatedEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(
        paginatedEmployees.map((_, index) => startIndex + index)
      );
    }
  };

  // Export selected employees as CSV
  const exportSelectedEmployees = () => {
    const selectedData = selectedEmployees.map((index) => employees[index]);
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Position",
      "Department",
      "Team",
      "Status",
    ];

    const csvData = selectedData.map((employee) => [
      employee.information.firstName,
      employee.information.lastName,
      employee.information.email,
      employee.information.phoneNumber,
      employee.employmentDetail.position.name,
      employee.employmentDetail.department.name,
      employee.employmentDetail.team.name,
      employee.employmentDetail.working_status,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "employees.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date to locale string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Calculate years of experience
  const calculateExperience = (hireDate: string) => {
    const hire = new Date(hireDate);
    const now = new Date();
    let years = now.getFullYear() - hire.getFullYear();
    const monthDiff = now.getMonth() - hire.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < hire.getDate())) {
      years--;
    }

    return years;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border border-border bg-card overflow-hidden p-0 isolate">
      <CardHeader className="bg-primary text-primary-foreground p-4 space-y-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
              <UsersIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-foreground">
                Danh Sách Nhân Viên
              </h2>
              <p className="text-xs text-primary-100">
                Hiển thị:{" "}
                {filteredEmployees.length > 0
                  ? `${startIndex + 1}-${Math.min(endIndex, filteredEmployees.length)} / ${filteredEmployees.length}`
                  : "0"}{" "}
                nhân viên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-primary-foreground/20 border-0 hover:bg-primary-foreground/30"
                    onClick={() => setIsSelectMode(!isSelectMode)}
                  >
                    <UserCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isSelectMode ? "Tắt chế độ chọn" : "Bật chế độ chọn"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-primary-foreground/20 border-0 hover:bg-primary-foreground/30"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tùy chọn hiển thị</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="text-xs font-medium mb-2">
                    Số nhân viên mỗi trang
                  </p>
                  <div className="flex gap-1">
                    {[5, 10, 20].map((num) => (
                      <Button
                        key={num}
                        variant={itemsPerPage === num ? "default" : "outline"}
                        size="sm"
                        className="flex-1 h-7"
                        onClick={() => setItemsPerPage(num)}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                <DropdownMenuSeparator />

                <div className="p-2">
                  <p className="text-xs font-medium mb-2">Sắp xếp theo</p>
                  <div className="space-y-1">
                    {[
                      {
                        id: "name" as const,
                        label: "Tên",
                        icon: <UserIcon className="h-3.5 w-3.5 mr-2" />,
                      },
                      {
                        id: "position" as const,
                        label: "Vị trí",
                        icon: <Briefcase className="h-3.5 w-3.5 mr-2" />,
                      },
                      {
                        id: "department" as const,
                        label: "Phòng ban",
                        icon: <BuildingIcon className="h-3.5 w-3.5 mr-2" />,
                      },
                      {
                        id: "hireDate" as const,
                        label: "Ngày vào làm",
                        icon: <CalendarIcon className="h-3.5 w-3.5 mr-2" />,
                      },
                    ].map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start h-8 ${sortBy === item.id ? "bg-primary/10 text-primary" : ""}`}
                        onClick={() => handleSort(item.id)}
                      >
                        {item.icon}
                        {item.label}
                        {sortBy === item.id &&
                          (sortDirection === "asc" ? (
                            <ChevronUpIcon className="h-3.5 w-3.5 ml-auto" />
                          ) : (
                            <ChevronDownIcon className="h-3.5 w-3.5 ml-auto" />
                          ))}
                      </Button>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-primary-foreground/20 border-0 hover:bg-primary-foreground/30"
                    onClick={exportSelectedEmployees}
                    disabled={selectedEmployees.length === 0}
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Xuất danh sách đã chọn</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-300" />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên theo tên, vị trí, phòng ban..."
              className="w-full bg-primary-700/30 text-primary-foreground border border-primary-500/50 rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-foreground/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="bg-primary-700/30 border border-primary-500/50 hover:bg-primary-700/50 gap-2 h-9"
              >
                <FilterIcon className="h-4 w-4" />
                {filterStatus === "all"
                  ? "Tất cả"
                  : filterStatus === "active"
                    ? "Đang làm việc"
                    : "Nghỉ việc"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                <UsersIcon className="h-4 w-4 mr-2" />
                Tất cả
                {filterStatus === "all" && (
                  <CheckCircleIcon className="h-4 w-4 ml-2" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                Đang làm việc
                {filterStatus === "active" && (
                  <CheckCircleIcon className="h-4 w-4 ml-2" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("inactive")}>
                <XCircleIcon className="h-4 w-4 mr-2 text-red-500" />
                Nghỉ việc
                {filterStatus === "inactive" && (
                  <CheckCircleIcon className="h-4 w-4 ml-2" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isSelectMode && selectedEmployees.length > 0 && (
          <div className="bg-primary/5 p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 hover:bg-primary/10"
                onClick={toggleSelectAll}
              >
                {selectedEmployees.length === paginatedEmployees.length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm font-medium">
                Đã chọn {selectedEmployees.length} nhân viên
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 hover:bg-primary/5 hover:border-primary/40"
                onClick={exportSelectedEmployees}
              >
                <DownloadIcon className="h-3.5 w-3.5 mr-1" />
                Xuất CSV
              </Button>
            </div>
          </div>
        )}

        {filteredEmployees.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Không tìm thấy nhân viên
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Không tìm thấy nhân viên nào phù hợp với tiêu chí tìm kiếm. Vui
              lòng thử lại với từ khóa khác hoặc điều chỉnh bộ lọc.
            </p>
            <Button
              variant="outline"
              className="mt-4 hover:bg-primary/5 hover:border-primary/40"
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedEmployees.map((employee, index) => {
              const actualIndex = startIndex + index;
              const fullName = `${employee.information.firstName} ${employee.information.lastName}`;
              const isActive =
                employee.employmentDetail.working_status === "active";
              const isExpanded = expandedEmployee === index;
              const isSelected = selectedEmployees.includes(actualIndex);
              const experience = calculateExperience(
                employee.information.hireDate
              );

              return (
                <div
                  key={index}
                  className={`transition-all duration-200 ${isSelected ? "bg-primary/5" : "hover:bg-accent/30"}`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Selection checkbox */}
                      {isSelectMode && (
                        <div className="pt-1">
                          <div
                            className={`w-5 h-5 rounded border ${
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground flex items-center justify-center"
                                : "border-border"
                            }`}
                            onClick={() => toggleSelectEmployee(actualIndex)}
                          >
                            {isSelected && (
                              <CheckCircleIcon className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Avatar and basic info */}
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-sm">
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
                            <div
                              className="bg-green-500 w-4 h-4 rounded-full border-2 border-card"
                              title="Đang làm việc"
                            ></div>
                          ) : (
                            <div
                              className="bg-red-500 w-4 h-4 rounded-full border-2 border-card"
                              title="Nghỉ việc"
                            ></div>
                          )}
                        </div>
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-bold text-foreground truncate">
                            {fullName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isActive ? "default" : "destructive"}
                              className={`text-xs ${isActive ? "bg-primary text-primary-foreground" : ""}`}
                            >
                              {isActive ? "Đang làm việc" : "Nghỉ việc"}
                            </Badge>

                            <Badge
                              variant="outline"
                              className="bg-accent/50 text-xs"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {experience} {experience === 1 ? "năm" : "năm"}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Briefcase className="h-3.5 w-3.5" />
                            <span>
                              {employee.employmentDetail.position.name}
                            </span>
                          </div>
                          <Separator orientation="vertical" className="h-3" />
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <BuildingIcon className="h-3.5 w-3.5" />
                            <span>
                              {employee.employmentDetail.department.name}
                            </span>
                          </div>
                          {employee.employmentDetail.team.name && (
                            <>
                              <Separator
                                orientation="vertical"
                                className="h-3"
                              />
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <UsersIcon className="h-3.5 w-3.5" />
                                <span>
                                  {employee.employmentDetail.team.name}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Always visible info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <CompactInfoItem
                            icon={<PhoneIcon className="h-3.5 w-3.5" />}
                            label="SĐT"
                            value={employee.information.phoneNumber}
                            copyable
                          />
                          <CompactInfoItem
                            icon={<MailIcon className="h-3.5 w-3.5" />}
                            label="Email"
                            value={employee.information.email}
                            copyable
                          />
                        </div>

                        {/* Expandable section */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-border/50 animate-in fade-in-50 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <CompactInfoItem
                                icon={<UserIcon className="h-3.5 w-3.5" />}
                                label="Giới tính"
                                value={
                                  employee.information.gender === "male"
                                    ? "Nam"
                                    : "Nữ"
                                }
                              />
                              <CompactInfoItem
                                icon={<CalendarIcon className="h-3.5 w-3.5" />}
                                label="Ngày sinh"
                                value={formatDate(
                                  employee.information.birthDate
                                )}
                              />
                              <CompactInfoItem
                                icon={<CalendarIcon className="h-3.5 w-3.5" />}
                                label="Ngày vào làm"
                                value={formatDate(
                                  employee.information.hireDate
                                )}
                              />
                              <CompactInfoItem
                                icon={<MapPinIcon className="h-3.5 w-3.5" />}
                                label="Địa chỉ"
                                value={employee.information.address}
                              />
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-between mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(index)}
                            className="text-xs h-7 px-2 hover:bg-primary/5"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUpIcon className="h-3.5 w-3.5 mr-1" />
                                Thu gọn
                              </>
                            ) : (
                              <>
                                <ChevronDownIcon className="h-3.5 w-3.5 mr-1" />
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
                                onProfileClick(actualIndex);
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
          </div>
        )}
      </CardContent>

      {/* Pagination */}
      {totalPages > 1 && (
        <CardFooter className="flex justify-between items-center p-4 border-t border-border bg-card">
          <div className="text-sm text-muted-foreground">
            Trang {currentPage} / {totalPages}
          </div>

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
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </PaginationPrevious>
              </PaginationItem>

              {totalPages <= 5 ? (
                // Show all pages if 5 or fewer
                [...Array(totalPages)].map((_, i) => (
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
                ))
              ) : (
                // Show limited pages with ellipsis for many pages
                <>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(1);
                      }}
                      isActive={currentPage === 1}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>

                  {currentPage > 3 && (
                    <PaginationItem>
                      <span className="px-2">...</span>
                    </PaginationItem>
                  )}

                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                      >
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {currentPage !== 1 && currentPage !== totalPages && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage);
                        }}
                        isActive
                      >
                        {currentPage}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                      >
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <span className="px-2">...</span>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(totalPages);
                      }}
                      isActive={currentPage === totalPages}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

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
                >
                  <ChevronRight className="h-4 w-4" />
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <div className="text-sm">
            <select
              className="bg-background border border-border rounded px-2 py-1 text-xs"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value="5">5 / trang</option>
              <option value="10">10 / trang</option>
              <option value="20">20 / trang</option>
            </select>
          </div>
        </CardFooter>
      )}
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
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (copyable) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`text-xs text-foreground font-medium ${
                  copyable
                    ? "cursor-pointer hover:text-primary transition-colors"
                    : ""
                }`}
                onClick={copyable ? handleCopy : undefined}
              >
                {value}
                {copied && (
                  <CheckCircleIcon className="inline-block h-3 w-3 ml-1 text-green-500" />
                )}
              </span>
            </TooltipTrigger>
            {copyable && (
              <TooltipContent>
                <p>{copied ? "Đã sao chép!" : "Nhấn để sao chép"}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
