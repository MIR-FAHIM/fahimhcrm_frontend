import React, { useState, useEffect } from "react";
import { socialPostProduct, fetchSocialPosts } from "../../api/controller/social_media_controller/social_media_controller";
import { TextField, Button, Typography, Box, Card, CardContent } from "@mui/material";

const SocialPost = () => {
  const [title, setTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("New");
  const [isActive, setIsActive] = useState("1");
  const [isVideo, setIsVideo] = useState("0");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch posts when the component mounts
  useEffect(() => {
    loadPosts();
  }, []);
  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchSocialPosts();
      console.log("data are", data);
      setPosts(data);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = new FormData();
    postData.append("title", title);
    postData.append("post_content", postContent);
    postData.append("product_id", productId);
    postData.append("type", type);
    postData.append("is_active", isActive);
    postData.append("is_video", isVideo);

    try {
      await socialPostProduct(postData);
      alert("Post created successfully!");
      setTitle("");
      setPostContent("");
      setProductId("");
      loadPosts(); // Refresh post list
    } catch (error) {
      alert("Error creating post. Check the console for details.");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>Create a Social Post</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Post Content"
          fullWidth
          multiline
          rows={3}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Product ID"
          fullWidth
          type="number"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Type"
          fullWidth
          value={type}
          onChange={(e) => setType(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Submit Post
        </Button>
      </form>

      <Typography variant="h5" sx={{ marginTop: 4 }}>Post List</Typography>
      {loading ? <Typography>Loading posts...</Typography> : null}
     
     

      {posts?.map((post) => (
        <Card key={post.id} sx={{ marginTop: 2 }}>
          <CardContent>
            <Typography variant="h6">{post.title}</Typography>
            <Typography>{post.post_content}</Typography>
            <Typography variant="caption">Type: {post.type}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default SocialPost;