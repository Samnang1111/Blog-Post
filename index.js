import express from "express";
import axios from "axios";

const app = express();
const port = 3000;

// Middleware
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Default blog posts
const defaultBlogPosts = [
  {
    id: 'post1',
    title: 'My Culinary Adventure in Davao',
    date: '2024-12-20',
    author: 'Nang',
    tags: ['foodie', 'travel', 'Davao'],
    excerpt: 'Last week, I explored the vibrant food scene in Davao City. From the famous durian...',
  },
];

// Store user-generated blog posts
const posts = [];

// Home Route
app.get("/", (req, res) => {
  res.render('index.ejs');
});

// About Route
app.get("/about", (req, res) => {
  res.render('about.ejs');
});

// Blog Routes
// List All Posts
app.get('/blog', async (req, res) => {
  const allPosts = [...defaultBlogPosts, ...posts];

  try {
    // Fetch additional data using axios
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts?_limit=5');
    const externalPosts = response.data.map(post => ({
      id: `ext-${post.id}`,
      title: post.title,
      date: new Date().toISOString().split('T')[0],
      author: 'External Source',
      tags: ['external', 'api'],
      excerpt: post.body.substring(0, 100) + '...',
    }));

    // Combine all posts
    const combinedPosts = [...allPosts, ...externalPosts];
    res.render('blog', { blogPosts: combinedPosts });
  } catch (error) {
    console.error('Error fetching external posts:', error);
    res.render('blog', { blogPosts: allPosts });
  }
});

// Create a New Post
app.get("/blog/create", (req, res) => {
  res.render('create.ejs');
});

// Handle Post Submission
app.post('/blog/submit', (req, res) => {
  const { title, body, date, author, tags, comments, htmlContent } = req.body;
  const id = `post${posts.length + 3}`; // Generate a unique ID for each new post

  // Add the new post to the posts array
  posts.push({
    id,
    title,
    body,
    date: date || new Date().toISOString().split('T')[0], // Default to today's date if not provided
    author,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    comments: parseComments(comments),
    htmlContent,
    excerpt: body.substring(0, 100) + '...', // Generate an excerpt
  });

  // Redirect to the blog page after submitting the new post
  res.redirect('/blog');
});

// Contact Route
app.get("/contact", (req, res) => {
  res.render('contact.ejs');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


// Parse comments into an array of objects
function parseComments(comments) {
  if (!comments) return [];
  return comments.split(',').map(comment => {
    const [username, text] = comment.split(':').map(item => item.trim());
    return { username, text };
  });
}
