import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { client, type Post } from '../lib/sanity';
import Header from '../components/Header';

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query = `*[_type == "post"] | order(publishedAt desc) {
          _id,
          title,
          slug,
          mainImage {
            asset-> {
              url
            }
          },
          publishedAt,
          excerpt,
          author-> {
            name,
            image {
              asset-> {
                url
              }
            }
          }
        }`;
        
        const result = await client.fetch(query);
        setPosts(result);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-8">Loading...</h1>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-8">Blog</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post._id}
                to={`/blog/${post.slug.current}`}
                className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-700 hover:border-purple-500"
              >
                {post.mainImage && (
                  <img
                    src={post.mainImage.asset.url}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-2">{post.title}</h2>
                  {post.excerpt && (
                    <p className="text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center">
                    {post.author?.image && (
                      <img
                        src={post.author.image.asset.url}
                        alt={post.author.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    )}
                    {post.author?.name && (
                      <span className="text-sm text-gray-400">{post.author.name}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
