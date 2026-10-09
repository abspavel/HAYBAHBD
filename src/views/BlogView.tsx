import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Calendar, Clock, Sparkles, ChevronRight, Share2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface Article {
  id: string;
  category: 'Trend' | 'Styling' | 'Fabric Guide';
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string[];
}

export const BlogView: React.FC = () => {
  const { navigateTo, showToast } = useShop();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const articles: Article[] = [
    {
      id: 'winter-2026-hoodies',
      category: 'Trend',
      title: 'Winter 2026: Why Heavyweight 420 GSM Streetwear Rules Bangladesh',
      excerpt: 'Explore why modern streetwear connoisseurs are shifting away from cheap blended fleece to heavyweight French Terry this winter.',
      date: 'October 2026',
      readTime: '4 min read',
      content: [
        'Winter in Bangladesh brings crisp mornings and breezy evenings where ordinary outerwear fails to hold its silhouette. Enter the heavyweight revolution.',
        'At 420 grams per square meter (GSM), French Terry fleece delivers dense warmth without causing static cling or unbreathable overheating. The loopback knit structure on the reverse side regulates micro-climate temperatures between your body and the outer air.',
        'Paired with HAYBAH’s dropped shoulder and double-lined hood architecture, each piece holds a sculptural drape that complements both minimalist joggers and wide-leg denim.',
      ],
    },
    {
      id: 'y2k-jersey-styling',
      category: 'Styling',
      title: 'The Y2K Motor & Athletic Jersey: Complete Styling Blueprint',
      excerpt: 'How to effortlessly pair boxy, graphic racing jerseys with modern baggy cargos, silver accents, and retro sneakers.',
      date: 'September 2026',
      readTime: '3 min read',
      content: [
        'Y2K athletic aesthetics are more than nostalgic throwbacks — they represent high-energy youth expression and speed-inspired typography.',
        'To style a HAYBAH Y2K Jersey properly, keep the proportions balanced: opt for relaxed-fit carpenter denim or structured tactical cargos that match the jersey’s broad shoulder seams.',
        'Footwear choices like retro skate shoes or chunky runner sneakers anchor the sporty aesthetic, while minimalist gold jewelry bridges vintage athletics with luxury street culture.',
      ],
    },
    {
      id: 'fabric-gsm-guide',
      category: 'Fabric Guide',
      title: 'Fabric GSM Decoded: What It Means and Why It Matters',
      excerpt: 'A comprehensive consumer guide to grams-per-square-meter, yarn counts, and how to verify apparel durability before buying.',
      date: 'August 2026',
      readTime: '5 min read',
      content: [
        'GSM stands for Grams per Square Meter. It is the definitive metric representing the density and thickness of a textile.',
        'Standard retail t-shirts in Bangladesh typically range from 160 to 180 GSM. While suitable for lightweight undershirts, they often turn limp and lose shape after three wash cycles.',
        'HAYBAH drop-shoulder t-shirts are produced in 260 GSM combed compact cotton. This provides substantial structure, prevents collar sagging, and eliminates translucency entirely.',
      ],
    },
    {
      id: 'shacket-layering',
      category: 'Styling',
      title: 'The Art of Shacket Layering: Transitional Streetwear',
      excerpt: 'Mastering the hybrid shirt-jacket for effortless transitional weather layering in Dhaka and Chittagong.',
      date: 'July 2026',
      readTime: '3 min read',
      content: [
        'A shacket combines the classic collar and button placket of an overshirt with the warmth and substantial weight of a lightweight jacket.',
        'Throw it unbuttoned over a clean white or dark green 260 GSM drop-shoulder tee for a relaxed architectural vibe, or button up to the throat on cooler rooftop evenings.',
      ],
    },
  ];

  const filteredArticles =
    selectedFilter === 'All'
      ? articles
      : articles.filter((a) => a.category === selectedFilter);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-20">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => {
          if (selectedArticle) {
            setSelectedArticle(null);
          } else {
            navigateTo('home');
          }
        }}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06201A] hover:text-[#AA820A] mb-5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{selectedArticle ? 'Back to All Articles' : 'Home / Blog & Lookbook'}</span>
      </button>

      {/* If article detail view is active */}
      {selectedArticle ? (
        <article className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#FAF7EC] text-[#AA820A] font-extrabold text-[11px] uppercase">
                {selectedArticle.category}
              </span>
              <span className="text-xs text-gray-400">• {selectedArticle.date}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                showToast('Article link copied to clipboard!');
              }}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              title="Share Article"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-[#06201A] leading-tight">
            {selectedArticle.title}
          </h1>

          <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed pt-2">
            {selectedArticle.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedArticle(null)}
              className="text-xs font-bold text-[#AA820A] hover:underline"
            >
              ← Back to Lookbook Articles
            </button>
            <button
              type="button"
              onClick={() => navigateTo('shop')}
              className="px-4 py-2 rounded-xl bg-[#06201A] text-[#D4AF37] font-bold text-xs uppercase"
            >
              Shop Featured Pieces
            </button>
          </div>
        </article>
      ) : (
        <>
          {/* Main Blog Header */}
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7EC] text-[#AA820A] border border-[#D4AF37]/30 text-xs font-black uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Editorial & Culture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#06201A] tracking-tight uppercase">
              BLOG & LOOKBOOK
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Style guides, textile deep-dives, and seasonal lookbooks directly from the HAYBAH atelier.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {['All', 'Trend', 'Styling', 'Fabric Guide'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === cat
                    ? 'bg-[#06201A] text-[#D4AF37] shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D4AF37]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs hover:shadow-lg hover:border-[#D4AF37]/40 transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7EC] text-[#AA820A] font-bold text-[10px] uppercase">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#06201A] group-hover:text-[#AA820A] transition-colors leading-snug mb-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-[#AA820A]">
                  <span>Read Article</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
