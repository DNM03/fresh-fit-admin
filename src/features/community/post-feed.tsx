import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Post } from "@/constants/types";
import PostCard from "./post-card";

// Mock data generator
const generateMockPosts = (type: string, page: number): Post[] => {
  const startId = (page - 1) * 5 + 1;
  return Array.from({ length: 5 }, (_, i) => ({
    id: `${startId + i}`,
    doctorId: `doctor-${((startId + i) % 10) + 1}`,
    doctorName: `Dr. ${
      [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
        "Rodriguez",
        "Martinez",
      ][(startId + i) % 10]
    }`,
    doctorSpecialty: [
      "Cardiologist",
      "Dermatologist",
      "Neurologist",
      "Pediatrician",
      "Psychiatrist",
    ][(startId + i) % 5],
    doctorAvatar: `/placeholder.svg?height=80&width=80`,
    content: `${type === "published" ? "Health tip" : "Pending review"} #${
      startId + i
    }: ${
      [
        "Regular exercise can help reduce the risk of chronic diseases.",
        "Drinking enough water is essential for maintaining good health.",
        "A balanced diet rich in fruits and vegetables supports your immune system.",
        "Getting 7-8 hours of sleep each night is crucial for your overall health.",
        "Managing stress through meditation or yoga can improve your mental health.",
        "Regular check-ups with your doctor can help detect health issues early.",
        "Limiting processed foods can reduce your risk of various health problems.",
        "Protecting your skin from the sun can prevent skin damage and cancer.",
        "Good posture can prevent back pain and improve your breathing.",
        "Washing your hands regularly can prevent the spread of infections.",
      ][(startId + i) % 10]
    }`,
    image: startId % 3 === 0 ? `/placeholder.svg?height=400&width=600` : null,
    likes: type === "published" ? Math.floor(Math.random() * 1000) : 0,
    isLiked: type === "published" ? Math.random() > 0.5 : false,
    isFollowing: Math.random() > 0.7,
    isSaved: Math.random() > 0.8,
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: type === "published" ? "published" : "pending",
  }));
};

interface PostFeedProps {
  type: "published" | "pending";
}

export default function PostFeed({ type }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    // Simulate API call with timeout
    setTimeout(() => {
      const newPosts = generateMockPosts(type, page);
      setPosts((prev) => [...prev, ...newPosts]);
      setPage((prev) => prev + 1);
      setLoading(false);

      // Stop after 5 pages for demo purposes
      if (page >= 5) {
        setHasMore(false);
      }
    }, 1000);
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

  const handleToggleFollow = (doctorId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.doctorId === doctorId
          ? { ...post, isFollowing: !post.isFollowing }
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
            onToggleFollow={handleToggleFollow}
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
