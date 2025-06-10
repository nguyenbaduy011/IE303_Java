import { AlertCircle, Bell, Calendar, Check, Clock, Info } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  NotificationRecipient,
  NotificationType,
  NotiType,
  UserType,
} from "@/types/types";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";

//Prop notification nhưng được thêm người gửi
interface NotificationWithReadStatus extends NotificationType {
  recipient: NotificationRecipient;
  sender?: UserType;
}

//props cho cửa sổ notification trên header
//currentUserId: truyền vào ID của user hiện tai
//notifications: truyền vào các thông báo có liên quan đến user hiện tại
//onMarkAsRead: truyền vào hàm callback khi trạng thái is_read của thông báo được cập nhật
//onMarkAllAsRead: truyền vào hàm callback khi trạng thái is_read của toàn bộ thông báo được cập nhật
interface NotificationWindowProps {
  currentUserId: string;
  notifications?: NotificationWithReadStatus[];
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
}

// Mock users data
const mockUsers: Record<string, UserType> = {
  user1: {
    id: "user1",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    birth_date: "1985-05-15",
    image_url: "https://i.pravatar.cc/150?img=1",
    gender: "male",
    nationality: "United States",
    phone_number: "+1 (555) 123-4567",
    hire_date: "2020-01-10",
    address: "123 Main St, Anytown, USA",
    created_at: "2020-01-10T08:00:00Z",
    updated_at: "2023-04-15T14:30:00Z",
  },
  user2: {
    id: "user2",
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.johnson@example.com",
    birth_date: "1990-08-22",
    image_url: "https://i.pravatar.cc/150?img=2",
    gender: "female",
    nationality: "Canada",
    phone_number: "+1 (555) 987-6543",
    hire_date: "2021-03-15",
    address: "456 Oak Ave, Somewhere, Canada",
    created_at: "2021-03-15T09:30:00Z",
    updated_at: "2023-02-10T11:45:00Z",
  },
  user3: {
    id: "user3",
    first_name: "Michael",
    last_name: "Chen",
    email: "michael.chen@example.com",
    birth_date: "1988-11-30",
    image_url: "https://i.pravatar.cc/150?img=3",
    gender: "male",
    nationality: "Singapore",
    phone_number: "+65 9123 4567",
    hire_date: "2019-07-22",
    address: "789 River Rd, Singapore",
    created_at: "2019-07-22T10:15:00Z",
    updated_at: "2023-01-05T16:20:00Z",
  },
  system: {
    id: "system",
    first_name: "System",
    last_name: "Notification",
    email: "system@example.com",
    birth_date: "2000-01-01",
    image_url: null,
    gender: "male",
    nationality: "Global",
    phone_number: "",
    hire_date: "2000-01-01",
    address: "",
    created_at: "2000-01-01T00:00:00Z",
    updated_at: "2000-01-01T00:00:00Z",
  },
};

// Mock notifications data
const mockNotifications: NotificationWithReadStatus[] = [
  {
    id: "notif1",
    title: "System Maintenance",
    sender_id: "system",
    message:
      "The system will be under maintenance this Saturday from 2 AM to 5 AM. Please save your work before this time.",
    expiry_date: "2023-12-31T23:59:59Z",
    type: "info",
    is_urgent: true,
    created_at: "2020-12-20", // 30 minutes ago
    updated_at: new Date(Date.now()).toISOString(),
    recipient: {
      notification_id: "notif1",
      user_id: "12345",
      is_read: false,
      read_at: null,
    },
    sender: mockUsers["system"],
  },
  {
    id: "notif2",
    title: "Project Deadline Reminder",
    sender_id: "user2",
    message:
      "This is a reminder that the project deadline is approaching. Please submit your work by the end of this week.",
    expiry_date: "2023-12-25T23:59:59Z",
    type: "reminder",
    is_urgent: true,
    created_at: new Date(Date.now()).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now()).toISOString(),
    recipient: {
      notification_id: "notif2",
      user_id: "12345",
      is_read: false,
      read_at: null,
    },
    sender: mockUsers["user2"],
  },
  {
    id: "notif3",
    title: "Login Attempt from New Device",
    sender_id: "system",
    message:
      "We detected a login attempt from a new device. If this wasn't you, please secure your account immediately.",
    expiry_date: "2023-12-20T23:59:59Z",
    type: "error",
    is_urgent: true,
    created_at: new Date(Date.now()).toISOString(), // 5 hours ago
    updated_at: new Date(Date.now()).toISOString(),
    recipient: {
      notification_id: "notif3",
      user_id: "12345",
      is_read: false,
      read_at: null,
    },
    sender: mockUsers["system"],
  },
  {
    id: "notif4",
    title: "New Team Member",
    sender_id: "user1",
    message:
      "Please welcome Michael Chen to our team! He will be joining us as a Senior Developer starting next Monday.",
    expiry_date: "2023-12-15T23:59:59Z",
    type: "info",
    is_urgent: true,
    created_at: new Date(Date.now()).toISOString(), // 1 day ago
    updated_at: new Date(Date.now()).toISOString(),
    recipient: {
      notification_id: "notif4",
      user_id: "12345",
      is_read: true,
      read_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    },
    sender: mockUsers["user1"],
  },
  {
    id: "notif5",
    title: "Quarterly Review",
    sender_id: "user3",
    message:
      "Your quarterly performance review is scheduled for next Thursday at 2 PM. Please prepare your self-assessment before the meeting.",
    expiry_date: "2023-12-10T23:59:59Z",
    type: "reminder",
    is_urgent: true,
    created_at: new Date(Date.now()).toISOString(), // 2 days ago
    updated_at: new Date(Date.now()).toISOString(),
    recipient: {
      notification_id: "notif5",
      user_id: "12345",
      is_read: true,
      read_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    sender: mockUsers["user3"],
  },
];

export function NotificationWindow({
  currentUserId,
  notifications = mockNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationWindowProps) {
  const userNotifications = notifications.filter(
    (n) => n.recipient.user_id == currentUserId
  );

  const [notificationItems, setNotificationItems] =
    useState<NotificationWithReadStatus[]>(userNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notificationItems.filter(
    (n) => !n.recipient.is_read
  ).length;

  //Hàm mark is_read cho thông báo
  const markAsRead = (id: string) => {
    setNotificationItems((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              recipient: {
                ...notification.recipient,
                is_read: true,
                read_at: new Date().toISOString(),
              },
            }
          : notification
      )
    );
    //Hàm callback gọi API sửa backend
    if (onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  //Hàm mark is_read cho toàn bộ thông báo
  const markAllAsRead = () => {
    setNotificationItems((prev) =>
      prev.map((notification) => ({
        ...notification,
        recipient: {
          ...notification.recipient,
          is_read: true,
          read_at: new Date().toISOString(),
        },
      }))
    );
    //Hàm callback gọi API sửa backend
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const getNotificationIcon = (type: NotiType, isUrgent: boolean) => {
    if (type === "info") {
      return (
        <Info
          className={cn(
            "h-4 w-4",
            isUrgent ? "text-blue-600" : "text-blue-500"
          )}
        />
      );
    } else if (type === "reminder") {
      return (
        <Calendar
          className={cn(
            "h-4 w-4",
            isUrgent ? "text-amber-600" : "text-amber-500"
          )}
        />
      );
    } else {
      return (
        <AlertCircle
          className={cn("h-4 w-4", isUrgent ? "text-red-600" : "text-red-500")}
        />
      );
    }
  };

  const getNotificationTypeStyle = (type: NotiType, isUrgent: boolean) => {
    if (type === "info") {
      return isUrgent ? "bg-blue-50 border-l-4 border-blue-500" : "";
    } else if (type === "reminder") {
      return isUrgent ? "bg-amber-50 border-l-4 border-amber-500" : "";
    } else {
      return isUrgent ? "bg-red-50 border-l-4 border-red-500" : "";
    }
  };

  //Hàm format lại ngày tháng cho chuẩn sử dụng thư viện date-fns
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch (e) {
      console.log(e);
      return "Invalid date";
    }
  };

  //Hàm lấy ký tự đầu trong tên của người gửi sau đó viết hoa
  const getSenderInitials = (sender?: UserType) => {
    if (!sender) return "??";
    return `${sender.first_name.charAt(0)}${sender.last_name.charAt(
      0
    )}`.toUpperCase();
  };

  //Hàm lấy tên đầy đủ của người gửi
  const getSenderFullName = (sender?: UserType) => {
    if (!sender) return "Unknown User";
    return `${sender.first_name} ${sender.last_name}`;
  };

  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          area-label="Notifications"
          className="relative cursor-pointer transition-colors"
          size="icon"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary",
                unreadCount > 0 && "animate-pulse"
              )}
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[400px] bg-background text-primary shadow-lg rounded-lg border"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="text-lg font-semibold p-0 ">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary hover:text-primary/80 hover:bg-slate-100"
              onClick={markAllAsRead}
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator className="bg-primary" />
        {notifications.length === 0 ? (
          <div className=" flex flex-col py-8 items-center text-muted-foreground ">
            <Bell className="mx-auto h-8 w-8 mb-2 opacity-20" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <>
            <div className="max-h-[400px] overflow-y-auto py-1">
              {notificationItems.map(
                (notification) =>
                  !notification.recipient.is_read && (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-3 p-4 cursor-pointer transition-colors",
                        notification.recipient.is_read
                          ? "bg-background"
                          : "bg-slate-50",
                        getNotificationTypeStyle(
                          notification.type,
                          notification.is_urgent
                        ),
                        "hover:bg-slate-100"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage
                          src={
                            notification.sender?.image_url || "placeholder.svg"
                          }
                        />
                        <AvatarFallback
                          className={cn(
                            "text-white font-medium",
                            notification.type === "info"
                              ? "bg-blue-500"
                              : notification.type === "reminder"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          )}
                        >
                          {getSenderInitials(notification.sender)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className=" relative flex items-start justify-between">
                          <div className="flex items-center justify-between gap-1.5">
                            {getNotificationIcon(
                              notification.type,
                              notification.is_urgent
                            )}
                            <p className="font-bold text-sx line-clamp-1">
                              {notification.title}
                            </p>
                          </div>
                          {notification.is_urgent && (
                            <Badge
                              variant="outline"
                              className="ml-1 py-0 h-5 text-[10px] font-medium bg-destructive text-white animate-pulse"
                            >
                              URGENT
                            </Badge>
                          )}
                          {!notification.recipient.is_read && (
                            <span className="absolute -right-2 -top-2 h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sx text-slate-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between  text-xs text-slate-500 mt-1">
                          <div className="flex items-center">
                            <span className="font-medium mr-1">From:</span>
                            {getSenderFullName(notification.sender)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDate(notification.created_at)}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )
              )}
            </div>
          </>
        )}
        <DropdownMenuSeparator className="bg-primary" />
        <div className="p-2">
          <DropdownMenuItem
            asChild
            className="w-full justify-center cursor-pointer"
          >
            <Link
              href="/notifications"
              className="text-center text-sm font-medium text-primary hover:text-primary/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              View all notifications
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
