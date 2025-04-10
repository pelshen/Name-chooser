import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PortableText } from '@portabletext/react';
import { client, type Post } from '../lib/sanity';
import Header from '../components/Header';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const query = `*[_type == "post" && slug.current == $slug][0] {
          _id,
          title,
          slug,
          mainImage {
            asset-> {
              url
            }
          },
          publishedAt,
          body,
          author-> {
            name,
            image {
              asset-> {
                url
              }
            }
          }
        }`;
        
        const result = await client.fetch(query, { slug });
        setPost(result);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

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

  if (!post) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-8">Post not found</h1>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <article className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold text-white mb-8">{post.title}</h1>
          
          {post.mainImage && (
            <img
              src={post.mainImage.asset.url}
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg mb-8"
            />
          )}

          {post.author && (
            <div className="flex items-center mb-8">
              {post.author.image && (
                <img
                  src={post.author.image.asset.url}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
              )}
              <div>
                <p className="font-semibold text-white">{post.author.name}</p>
                <p className="text-sm text-gray-400">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          <div className="prose prose-lg prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-purple-400 hover:prose-a:text-purple-300 prose-strong:text-white prose-code:text-purple-300 prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700">
            <PortableText value={post.body} />
          </div>
        </div>
      </article>
    </>
  );
}
