import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Check, X, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostCardProps {
  post: any;
  isAdmin: boolean;
  onVerify: (postId: string) => void;
  onReject: (postId: string) => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onLikePost?: (postId: string, current_user_react: any) => void;
}

export default function PostCard({
  post,
  isAdmin,
  onVerify,
  onReject,
  onLikePost,
}: PostCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);

  const userName = post?.user?.fullName || "Unknown User";
  const userAvatar = post?.user?.avatar;

  const contentMaxLength = 300;
  const content = post?.content || "";
  const isContentLong = content.length > contentMaxLength;

  const displayContent = showFullContent
    ? content
    : isContentLong
    ? content.substring(0, contentMaxLength) + "..."
    : content;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {userAvatar ? "" : getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{userName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post?.created_at), {
                addSuffix: true,
              })}
            </div>
            {post.status === "Pending" && (
              <Badge
                variant="outline"
                className="text-amber-500 border-amber-500"
              >
                Pending
              </Badge>
            )}
            {post.status === "Rejected" && (
              <Badge
                variant="outline"
                className="text-destructive border-destructive"
              >
                Rejected
              </Badge>
            )}
          </div>
        </div>
        {(post.status === "Rejected" || post.status === "Pending") &&
          post.postFeedBacks &&
          post.postFeedBacks.length > 0 && (
            <div className="mt-2 mb-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="w-full">
                  <h4 className="text-sm font-medium text-red-800">
                    Not approved for the following{" "}
                    {post.postFeedBacks.length > 1 ? "reasons" : "reason"}:
                  </h4>
                  <div className="mt-1 space-y-2">
                    {post.postFeedBacks.map((feedback: any, index: number) => (
                      <div
                        key={feedback._id || index}
                        className="text-sm text-red-700"
                      >
                        {post.postFeedBacks.length > 0 && (
                          <span className="font-medium">{index + 1}. </span>
                        )}
                        {feedback.comment}

                        {/* Show who provided the feedback and when */}
                        {feedback.admin && (
                          <div className="text-xs text-red-600 mt-1">
                            - {feedback.admin.fullName || "Admin"},
                            {feedback.created_at && (
                              <span>
                                {" "}
                                {formatDistanceToNow(
                                  new Date(feedback.created_at),
                                  { addSuffix: true }
                                )}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Add separator if not the last item */}
                        {index < post.postFeedBacks.length - 1 && (
                          <div className="border-b border-red-200 my-2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        {post.title && (
          <h3 className="text-xl font-semibold mt-2">{post.title}</h3>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-0 px-8">
        <div className="whitespace-pre-line mb-4">
          <p>{displayContent}</p>

          {isContentLong && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-primary font-medium text-sm mt-2 hover:underline focus:outline-none"
            >
              {showFullContent ? "Read less" : "Read more"}
            </button>
          )}
        </div>
        {post.medias && post.medias.length > 0 && (
          <div
            className={`mt-4 ${
              post.medias.length === 1 ? "" : "grid grid-cols-2"
            } gap-2`}
          >
            {post.medias.length === 1 ? (
              <div className="relative overflow-hidden rounded-md">
                {post.medias[0] &&
                  post.medias[0] !== "" &&
                  post.medias[0].startsWith("http") && (
                    <img
                      src={post.medias[0]}
                      alt={`Post image`}
                      className="w-full max-h-96 object-contain rounded-md"
                      onClick={() => window.open(post.medias[0], "_blank")}
                      style={{ cursor: "pointer" }}
                    />
                  )}
              </div>
            ) : (
              post.medias
                .filter(
                  (image: string) =>
                    image && image !== "" && image.startsWith("http")
                )
                .map((image: string, index: number) => (
                  <div
                    key={index}
                    className={`relative overflow-hidden rounded-md ${
                      index >= 4 && post.medias.length > 4
                        ? "hidden md:block"
                        : ""
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="rounded-md object-cover w-full aspect-square"
                      onClick={() => window.open(image, "_blank")}
                      style={{ cursor: "pointer" }}
                    />
                    {index === 3 && post.medias.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-lg font-medium">
                          +{post.medias.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-wrap gap-4 items-center px-8">
        <div className="flex items-center gap-4">
          <button
            className={`flex items-center gap-1 hover:cursor-pointer ${
              post.reactions.current_user_react ? "text-red-500" : ""
            }`}
            onClick={() => {
              if (onLikePost) {
                onLikePost(post._id, post.reactions.current_user_react);
              }
            }}
            disabled={post.status !== "Published"}
          >
            <Heart
              className={`h-4 w-4 ${
                post.reactions.current_user_react ? "fill-current" : ""
              }`}
            />
            <span>{post.reactions ? post.reactions.Like : ""}</span>
          </button>

          {/* <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 ${
              post.isSaved ? "text-primary" : ""
            }`}
            onClick={() => onToggleSave(post._id)}
          >
            <Bookmark
              className={`h-5 w-5 ${post.isSaved ? "fill-primary" : ""}`}
            />
            <span className="sr-only">{post.isSaved ? "Unsave" : "Save"}</span>
          </Button> */}
        </div>

        {isAdmin && post.status === "Pending" && (
          <div className="flex items-center gap-2 ml-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={() => {
                      onReject(post._id);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reject this post with a reason</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-600 hover:bg-green-600/10"
                    onClick={() => onVerify(post._id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Approve this post</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
