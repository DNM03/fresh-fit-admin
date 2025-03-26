import React, { useState, useRef, DragEvent, ChangeEvent } from "react";

export interface VideoFile {
  url: string;
  name: string;
  size: number;
  type: string;
  file: File;
  duration?: number;
}

interface VideoDropzoneProps {
  onVideoChange?: (video: VideoFile | null) => void;
  maxSizeInMB?: number;
  allowedTypes?: string[];
  className?: string;
  initialVideo?: VideoFile | null;
}

const VideoDropzone: React.FC<VideoDropzoneProps> = ({
  onVideoChange,
  maxSizeInMB = 100,
  allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
  className = "",
  initialVideo = null,
}) => {
  const [video, setVideo] = useState<VideoFile | null>(initialVideo);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Convert MB to bytes
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const handleDragEnter = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFile = (file: File): void => {
    setError(null);

    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`);
      return;
    }

    if (file.size > maxSizeInBytes) {
      setError(
        `File ${file.name} exceeds the maximum size of ${maxSizeInMB}MB`
      );
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        const newVideo: VideoFile = {
          url: e.target.result as string,
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
        };

        setVideo(newVideo);

        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              const duration = videoRef.current.duration;
              const updatedVideo = { ...newVideo, duration };
              setVideo(updatedVideo);

              if (onVideoChange) {
                onVideoChange(updatedVideo);
              }
            }
          };
        } else {
          if (onVideoChange) {
            onVideoChange(newVideo);
          }
        }

        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Error reading file");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeVideo = (): void => {
    setVideo(null);

    if (onVideoChange) {
      onVideoChange(null);
    }

    setError(null);
  };

  const openFileDialog = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className={`w-full ${className}`}>
      {!video ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <div className="mb-4 flex justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <p className="text-lg mb-2 font-medium text-gray-700">
            Drag and drop video here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse files (max {maxSizeInMB}MB)
          </p>
          <p className="text-xs text-gray-400">
            Supported formats:{" "}
            {allowedTypes.map((type) => type.split("/")[1]).join(", ")}
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={allowedTypes.join(",")}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="relative">
            <video
              ref={videoRef}
              src={video.url}
              className="w-full h-auto"
              controls
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeVideo();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              title="Remove video"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <div className="p-4 bg-gray-50">
            <h3 className="font-medium text-gray-800 truncate">{video.name}</h3>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  ></path>
                </svg>
                {formatFileSize(video.size)}
              </span>
              {video.duration && (
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  {formatDuration(video.duration)}
                </span>
              )}
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  ></path>
                </svg>
                {video.type.split("/")[1].toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-2 text-blue-500 text-sm flex items-center">
          <svg
            className="animate-spin h-4 w-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading video...
        </div>
      )}

      {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
    </div>
  );
};

export default VideoDropzone;
