export type UserType = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string; // Sử dụng string để biểu diễn ISO date
  image_url?: string | null;
  gender: "male" | "female";
  nationality: string;
  phone_number: string;
  hire_date: string; // Sử dụng string cho date
  address: string;
  createdAt: string; // Sử dụng string cho date
  updatedAt: string; // Sử dụng string cho date
};


//notification
export type NotiType = "info" | "reminder" | "error";

export interface NotificationType {
  id: string; 
  title: string;
  sender_id: string;
  message: string;
  expiry_date: string; 
  type: NotiType;
  is_urgent: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationRecipient {
  notification_id: string;
  user_id: string;
  is_read: boolean;
  read_at: string | null; 
}
