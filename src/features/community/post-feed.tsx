import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Post } from "@/constants/types";
import PostCard from "./post-card";
import postService from "@/services/post.service";

interface PostFeedProps {
  type: "published" | "pending";
}

// Define interface for API response structure
// interface PostApiResponse {
//   result: {
//     data: Post[];
//     page: number;
//     limit: number;
//     total_items: number;
//     total_pages: number;
//   };
// }

export default function PostFeed({ type }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      // Use the real API to fetch posts
      const response = await postService.searchPost({
        page,
        limit: 10,
        status: type === "published" ? "Published" : "Pending",
        sort_by: "created_at",
        order_by: "desc",
      });

      const result = response.data as any;
      if (result?.result?.posts?.length > 0) {
        // Filter out any posts that already exist in our current state
        setPosts((prev) => {
          const existingIds = new Set(prev.map((post) => post.id));
          const newPosts = result.result.posts.filter(
            (post: any) => !existingIds.has(post.id)
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

  const handleVerify = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, status: "published" } : post
      )
    );
  };

  const handleReject = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
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
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
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
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isAdmin={true}
            onVerify={handleVerify}
            onReject={handleReject}
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
    </div>
  );
}
