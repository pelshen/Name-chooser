import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PortableText, PortableTextComponentProps, PortableTextMarkComponentProps, PortableTextBlockComponent, PortableTextBlock } from '@portabletext/react';
import { client, type Page } from '../lib/sanity';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

const components = {
  block: {
    normal: ({children}: PortableTextComponentProps<PortableTextBlock>) => (
      <p className="text-gray-200 mb-4">{children}</p>
    ),
    h2: ({children}: PortableTextComponentProps<PortableTextBlock>) => (
      <h2 className="text-white text-2xl font-bold mt-8 mb-4">{children}</h2>
    ),
    h3: ({children}: PortableTextComponentProps<PortableTextBlock>) => (
      <h3 className="text-white text-xl font-bold mt-6 mb-3">{children}</h3>
    ),
  },
  list: {
    bullet: ({children}: PortableTextComponentProps<PortableTextBlock>) => (
      <ul className="text-gray-200 list-disc pl-6 mb-4 space-y-2">{children}</ul>
    ),
    number: ({children}: PortableTextComponentProps<PortableTextBlock>) => (
      <ol className="text-gray-200 list-decimal pl-6 mb-4 space-y-2">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({children}: PortableTextComponentProps<PortableTextBlock>) => (
      <li className="text-gray-200">{children}</li>
    ),
    number: ({children}: PortableTextComponentProps<PortableTextBlock>) => (
      <li className="text-gray-200">{children}</li>
    ),
  },
  marks: {
    link: ({children, value}: PortableTextMarkComponentProps) => {
      const href = value?.href || '#';
      return (
        <a href={href} className="text-purple-400 hover:text-purple-300 underline">
          {children}
        </a>
      );
    },
  }
};

export default function DynamicPage() {
  const { slug } = useParams();
  const location = useLocation();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        // If we have a slug from params, use it; otherwise extract from pathname
        const pageSlug = slug || location.pathname.replace('/', '');
        
        const query = `*[_type == "page" && slug.current == $slug][0] {
          _id,
          title,
          slug,
          body,
          seo
        }`;
        
        const result = await client.fetch(query, { slug: pageSlug });
        setPage(result);
      } catch (error) {
        console.error('Error fetching page:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug, location.pathname]);

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

  if (!page) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-8">Page not found</h1>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        {page.seo?.metaTitle && <title>{page.seo.metaTitle}</title>}
        {page.seo?.metaDescription && (
          <meta name="description" content={page.seo.metaDescription} />
        )}
      </Helmet>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Header />
        <main className="flex-grow pt-32 pb-20">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
              {page.title}
            </h1>
            <div className="space-y-6">
              <PortableText 
                value={page.body}
                components={components}
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
