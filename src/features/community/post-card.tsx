import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Check, X, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PostCardProps {
  post: any;
  isAdmin: boolean;
  onVerify: (postId: string) => void;
  onReject: (postId: string) => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
}

export default function PostCard({
  post,
  isAdmin,
  onVerify,
  onReject,
}: PostCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-2xl">{post?.title}</span>
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
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-line mb-4">{post?.content}</p>

        {/* Rejection Reason Section */}
        {post.status === "Rejected" && post.rejection_reason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">
                  Rejection Reason:
                </p>
                <p className="text-sm text-muted-foreground">
                  {post.rejection_reason}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(post?.created_at), { addSuffix: true })}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1 text-red-500`}>
            <Heart className={`h-5 w-5 fill-red-500`} />
            <span>
              {post?.reactions?.Like > 0 ? post?.reactions?.Like : "0"}
            </span>
          </div>

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
