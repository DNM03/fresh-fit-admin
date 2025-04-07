import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Bookmark,
  UserPlus,
  MoreHorizontal,
  Check,
  X,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Post } from "@/constants/types";

interface PostCardProps {
  post: Post;
  isAdmin: boolean;
  onVerify: (postId: string) => void;
  onReject: (postId: string) => void;
  onToggleLike: (postId: string) => void;
  onToggleFollow: (doctorId: string) => void;
  onToggleSave: (postId: string) => void;
}

export default function PostCard({
  post,
  isAdmin,
  onVerify,
  onReject,
  onToggleLike,
  onToggleFollow,
  onToggleSave,
}: PostCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={post.doctorAvatar} alt={post.doctorName} />
          <AvatarFallback>{post.doctorName.substring(0, 2)}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{post.doctorName}</span>
            {post.status === "pending" && (
              <Badge
                variant="outline"
                className="text-amber-500 border-amber-500"
              >
                Pending
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {post.doctorSpecialty}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={post.isFollowing ? "text-primary" : ""}
            onClick={() => onToggleFollow(post.doctorId)}
          >
            {post.isFollowing ? (
              <UserCheck className="h-5 w-5" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            <span className="sr-only">
              {post.isFollowing ? "Unfollow" : "Follow"}
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleSave(post.id)}>
                {post.isSaved ? "Unsave post" : "Save post"}
              </DropdownMenuItem>
              <DropdownMenuItem>Report post</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-line mb-4">{post.content}</p>

        {post.image && (
          <div className="relative rounded-md overflow-hidden mb-4">
            <img
              src={post.image || "/placeholder.svg"}
              alt="Post image"
              width={600}
              height={400}
              className="w-full object-cover"
            />
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 ${
              post.isLiked ? "text-red-500" : ""
            }`}
            onClick={() => onToggleLike(post.id)}
          >
            <Heart
              className={`h-5 w-5 ${post.isLiked ? "fill-red-500" : ""}`}
            />
            <span>{post.likes > 0 ? post.likes : ""}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 ${
              post.isSaved ? "text-primary" : ""
            }`}
            onClick={() => onToggleSave(post.id)}
          >
            <Bookmark
              className={`h-5 w-5 ${post.isSaved ? "fill-primary" : ""}`}
            />
            <span className="sr-only">{post.isSaved ? "Unsave" : "Save"}</span>
          </Button>
        </div>

        {isAdmin && post.status === "pending" && (
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive hover:bg-destructive/10"
              onClick={() => onReject(post.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-600 hover:bg-green-600/10"
              onClick={() => onVerify(post.id)}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
