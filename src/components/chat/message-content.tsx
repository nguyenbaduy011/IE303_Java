/* eslint-disable @next/next/no-img-element */
import React from "react";
import { MessageResponseDto } from "@/types/message-types";
import {
  FileIcon,
  Download,
  Eye,
  Play,
  Volume2,
  Image,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageContentProps {
  message: MessageResponseDto;
  isOwn: boolean;
}

const MessageContent: React.FC<MessageContentProps> = ({ message, isOwn }) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Render cho tin nhắn text thông thường
  if (message.messageType === "TEXT") {
    return (
      <div className="whitespace-pre-wrap break-words leading-relaxed">
        {message.content}
      </div>
    );
  }

  // Render cho tin nhắn có file
  const fileUrl = message.displayUrl ? `${baseUrl}${message.displayUrl}` : null;
  const downloadUrl = message.fileUrl
    ? `${baseUrl}/api/files/${message.id}`
    : null;

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName?: string) => {
    if (!fileName)
      return (
        <FileIcon size={20} className="text-blue-600 dark:text-blue-400" />
      );
    const ext = fileName.toLowerCase().split(".").pop();

    switch (ext) {
      case "pdf":
        return (
          <FileText size={20} className="text-red-500 dark:text-red-400" />
        );
      case "doc":
      case "docx":
        return (
          <FileText size={20} className="text-blue-600 dark:text-blue-400" />
        );
      case "xls":
      case "xlsx":
        return (
          <FileText size={20} className="text-green-600 dark:text-green-400" />
        );
      case "ppt":
      case "pptx":
        return (
          <FileText
            size={20}
            className="text-orange-500 dark:text-orange-400"
          />
        );
      case "txt":
        return (
          <FileText size={20} className="text-gray-600 dark:text-gray-400" />
        );
      case "zip":
      case "rar":
      case "7z":
        return (
          <FileIcon
            size={20}
            className="text-purple-600 dark:text-purple-400"
          />
        );
      default:
        return (
          <FileIcon size={20} className="text-blue-600 dark:text-blue-400" />
        );
    }
  };

  switch (message.messageType) {
    case "IMAGE":
      return (
        <div className="space-y-3">
          {message.content && message.content.trim() !== "" && (
            <div className="whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </div>
          )}
          {fileUrl && (
            <div className="relative group rounded-xl overflow-hidden bg-card max-w-[320px] shadow-sm border">
              <img
                src={fileUrl}
                alt={message.fileOriginalName || "Image"}
                className="w-full h-auto max-h-[250px] object-cover cursor-pointer hover:opacity-95 transition-all duration-200"
                onClick={() => window.open(fileUrl, "_blank")}
                onError={(e) => {
                  console.error("Error loading image:", fileUrl);
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-black/70 hover:bg-black/80 text-white border-0 rounded-full shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(downloadUrl || fileUrl, "_blank");
                  }}
                >
                  <Download size={14} />
                </Button>
              </div>
              {message.fileOriginalName && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent text-white p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Image size={14} aria-label="image file icon" />
                      <span className="truncate text-sm font-medium">
                        {message.fileOriginalName}
                      </span>
                    </div>
                    <span className="ml-2 flex-shrink-0 text-xs opacity-90">
                      {formatFileSize(message.fileSize)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );

    case "VIDEO":
      return (
        <div className="space-y-3">
          {message.content && message.content.trim() !== "" && (
            <div className="whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </div>
          )}
          {fileUrl && (
            <div className="relative rounded-xl overflow-hidden bg-card max-w-[320px] shadow-sm border">
              <video
                controls
                className="w-full h-auto max-h-[250px]"
                preload="metadata"
              >
                <source src={fileUrl} type={message.fileContentType} />
                <div className="p-4 text-center text-muted-foreground">
                  Trình duyệt không hỗ trợ video.
                </div>
              </video>
              <div className="p-3 bg-card border-t">
                <FileInfo
                  fileName={message.fileOriginalName}
                  fileSize={message.fileSize}
                  downloadUrl={downloadUrl}
                  icon={
                    <Play
                      size={16}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  }
                  isOwn={isOwn}
                />
              </div>
            </div>
          )}
        </div>
      );

    case "AUDIO":
      return (
        <div className="space-y-3">
          {message.content && message.content.trim() !== "" && (
            <div className="whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </div>
          )}
          <div
            className={`p-4 rounded-xl w-[280px] shadow-sm border transition-all duration-200 ${
              isOwn
                ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                : "bg-card border-border"
            }`}
          >
            {fileUrl && (
              <audio controls className="w-full mb-3 h-10 rounded-lg">
                <source src={fileUrl} type={message.fileContentType} />
                Trình duyệt không hỗ trợ audio.
              </audio>
            )}
            <FileInfo
              fileName={message.fileOriginalName}
              fileSize={message.fileSize}
              downloadUrl={downloadUrl}
              icon={
                <Volume2
                  size={16}
                  className="text-blue-600 dark:text-blue-400"
                />
              }
              isOwn={isOwn}
            />
          </div>
        </div>
      );

    case "FILE":
      return (
        <div className="space-y-3">
          {message.content && message.content.trim() !== "" && (
            <div className="whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </div>
          )}
          <div
            className={`p-4 rounded-xl w-[300px] shadow-sm border transition-all duration-200 hover:shadow-md ${
              isOwn
                ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750"
                : "bg-card border-border hover:bg-accent/50"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`flex-shrink-0 p-2 rounded-lg ${
                  isOwn ? "bg-gray-100 dark:bg-gray-700" : "bg-primary/10"
                }`}
              >
                {getFileIcon(message.fileOriginalName)}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold truncate mb-1 ${
                    isOwn
                      ? "text-gray-900 dark:text-gray-100"
                      : "text-foreground"
                  }`}
                >
                  {message.fileOriginalName || "File"}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${
                      isOwn
                        ? "text-gray-600 dark:text-gray-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatFileSize(message.fileSize)}
                  </span>
                  <div
                    className={`h-1 w-1 rounded-full ${
                      isOwn
                        ? "bg-gray-400 dark:bg-gray-500"
                        : "bg-muted-foreground"
                    }`}
                  ></div>
                  <span
                    className={`text-xs capitalize ${
                      isOwn
                        ? "text-gray-600 dark:text-gray-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.fileOriginalName
                      ?.split(".")
                      .pop()
                      ?.toUpperCase() || "FILE"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {fileUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-8 w-8 p-0 ${
                      isOwn
                        ? "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                        : "hover:bg-primary/20 text-primary"
                    }`}
                    onClick={() => window.open(fileUrl, "_blank")}
                    title="Xem file"
                  >
                    <Eye size={14} />
                  </Button>
                )}
                {downloadUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-8 w-8 p-0 ${
                      isOwn
                        ? "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                        : "hover:bg-primary/20 text-primary"
                    }`}
                    onClick={() => window.open(downloadUrl, "_blank")}
                    title="Tải xuống"
                  >
                    <Download size={14} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </div>
      );
  }
};

// Component phụ hiển thị thông tin file - được cải thiện cho dark mode
const FileInfo: React.FC<{
  fileName?: string;
  fileSize?: number;
  downloadUrl?: string | null;
  icon: React.ReactNode;
  isOwn: boolean;
}> = ({ fileName, fileSize, downloadUrl, icon, isOwn }) => {
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p
            className={`font-medium truncate text-sm ${
              isOwn ? "text-gray-900 dark:text-gray-100" : "text-foreground"
            }`}
          >
            {fileName || "File"}
          </p>
          <p
            className={`text-xs ${
              isOwn
                ? "text-gray-600 dark:text-gray-400"
                : "text-muted-foreground"
            }`}
          >
            {formatFileSize(fileSize)}
          </p>
        </div>
      </div>
      {downloadUrl && (
        <Button
          size="sm"
          variant="ghost"
          className={`h-8 w-8 p-0 ml-3 ${
            isOwn
              ? "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
              : "hover:bg-primary/20 text-primary"
          }`}
          onClick={() => window.open(downloadUrl, "_blank")}
          title="Tải xuống"
        >
          <Download size={12} />
        </Button>
      )}
    </div>
  );
};

export default MessageContent;
