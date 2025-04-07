import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostFeed from "@/features/community/post-feed";
import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

export default function Community() {
  const [activeTab, setActiveTab] = useState("published");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Health Community</h1>

      <Tabs defaultValue="published" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6 bg-muted shadow-md overflow-hidden w-full relative !px-0">
          <TabsTrigger
            value="published"
            className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-50"
          >
            Published Posts
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="flex items-center justify-center transition-all duration-300 data-[state=active]:text-primary data-[state=active]:bg-green-50"
          >
            Pending Verification
          </TabsTrigger>
          <motion.div
            className="absolute bottom-0 h-1 bg-primary rounded-full"
            layout
            initial={false}
            animate={{
              left: activeTab === "published" ? "0%" : "50%",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ width: "50%" }}
          />
        </TabsList>

        <TabsContent value="published">
          <PostFeed type="published" />
        </TabsContent>

        <TabsContent value="pending">
          <PostFeed type="pending" />
        </TabsContent>
      </Tabs>

      <button
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-600"
      >
        <ArrowUp className="h-8 w-8" />
      </button>
    </div>
  );
}
