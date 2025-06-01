import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Post } from "@/constants/types";
import PostCard from "./post-card";
import postService from "@/services/post.service";
import RejectPostDialog from "./reject-post-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface PostFeedProps {
  type: "published" | "pending" | "rejected";
}

export default function PostFeed({ type }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const observerTarget = useRef(null);

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      // Map our UI types to API status values
      const statusMap = {
        published: "Published",
        pending: "Pending",
        rejected: "Rejected",
      };

      // Use the real API to fetch posts
      const response = await postService.searchPost({
        page,
        limit: 10,
        status: statusMap[type],
        sort_by: "created_at",
        order_by: "desc",
      });

      const result = response.data as any;
      if (result?.result?.posts?.length > 0) {
        // Fix: Make sure we're correctly comparing _id properties
        setPosts((prev) => {
          const existingIds = new Set(prev.map((post) => post._id));

          // Fix: Use post._id instead of post.id in the filter
          const newPosts = result.result.posts.filter(
            (post: any) => !existingIds.has(post._id)
          );

          return [...prev, ...newPosts];
        });
        setPage((prev) => prev + 1);

        // Check if we've reached the last page
        if (page >= result.result.total_pages) {
          setHasMore(false);
        }
      } else {
        // No more data to load
        setHasMore(false);
      }

      console.log("Fetched posts:", result.result);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setHasMore(false); // Prevent further attempts if there's an error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset when type changes
    setPosts([]);
    setPage(1);
    setHasMore(true);
    loadMorePosts();
  }, [type]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loading, hasMore]);

  const handleOpenVerifyDialog = (postId: string) => {
    setSelectedPostId(postId);
    setIsVerifyDialogOpen(true);
  };

  const handleVerify = async () => {
    if (!selectedPostId) return;

    try {
      await postService.approvePost(selectedPostId);
      setPosts((prev) => prev.filter((post) => post._id !== selectedPostId));
      setIsVerifyDialogOpen(false);
      toast.success("Post approved successfully!");
    } catch (error) {
      toast.error("Failed to approve post. Please try again.");
      console.error("Error approving post:", error);
    }
  };

  const handleOpenRejectDialog = (postId: string) => {
    setSelectedPostId(postId);
    setIsRejectDialogOpen(true);
  };

  const handleRejectConfirm = async (postId: string, reason: string) => {
    console.log("Rejecting post:", postId, "Reason:", reason);
    try {
      await postService.rejectPost(postId, {
        comment: reason,
        medias: [],
      });
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      setIsRejectDialogOpen(false);
      toast.success("Post rejected successfully!");
    } catch (error) {
      toast.error("Failed to reject post. Please try again.");
      console.error("Error rejecting post:", error);
    }
  };

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleToggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId ? { ...post, isSaved: !post.isSaved } : post
      )
    );
  };

  return (
    <div className="space-y-6">
      {posts.length === 0 && !loading ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No posts available</p>
        </div>
      ) : (
        // Add index to ensure unique keys even if there are duplicate IDs
        posts.map((post, index) => (
          <PostCard
            key={`${post._id}-${index}`}
            post={post}
            isAdmin={true}
            onVerify={handleOpenVerifyDialog}
            onReject={handleOpenRejectDialog}
            onToggleLike={handleToggleLike}
            onToggleSave={handleToggleSave}
          />
        ))
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!loading && hasMore && <div ref={observerTarget} className="h-4" />}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">No more posts to load</p>
        </div>
      )}

      {/* Verify Post Dialog */}
      <AlertDialog
        open={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Verify Post
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this post? Once approved, the
              post will be published and visible to all users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerify}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Post Dialog */}
      <RejectPostDialog
        isOpen={isRejectDialogOpen}
        postId={selectedPostId}
        onClose={() => setIsRejectDialogOpen(false)}
        onReject={handleRejectConfirm}
      />
    </div>
  );
}
