import axios from "axios";
const BASE_IMAGE_LINK =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvgd7g3BBpB-DIli1sviEqpBHQZ_7d6DQ9sA&s";
export const getImageThumbnailLink = async (
  searchTerm: string
): Promise<string> => {
  try {
    const header = {
      "X-API-KEY": import.meta.env.VITE_SERPER_API_KEY,
    };
    const searchQuery = {
      q: searchTerm, // image name
      type: "images",
      engine: "google",
      num: 10,
    };

    const response = await axios.post(
      "https://google.serper.dev/images",
      searchQuery,
      {
        headers: header,
      }
    );
    return response.data?.images[0]?.thumbnailUrl || BASE_IMAGE_LINK;
  } catch (error) {
    console.log("Error fetching image link:", error);
    return BASE_IMAGE_LINK;
  }
};
