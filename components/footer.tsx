import Link from 'next/link';
import { BookOpen, Mail, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-50 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-saffron-300" />
              <span className="font-display text-xl font-bold text-ink-200">
                মলির দুনিয়া 
              </span>
            </Link>
            <p className="bengali-text text-ink-100 max-w-md">
              বাংলা সাহিত্যের জন্য একটি আধুনিক প্ল্যাটফর্ম। প্রবন্ধ, কবিতা, বই রিভিউ - সবই একসাথে।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-ink-200 mb-4">দ্রুত লিংক</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-ink-100 hover:text-saffron-300 transition-colors">
                  ব্লগ
                </Link>
              </li>
              <li>
                <Link href="/kobita" className="text-ink-100 hover:text-saffron-300 transition-colors">
                  কবিতা
                </Link>
              </li>
              <li>
                <Link href="/boimela" className="text-ink-100 hover:text-saffron-300 transition-colors">
                  বইমেলা
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-ink-100 hover:text-saffron-300 transition-colors">
                  ড্যাশবোর্ড
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-ink-200 mb-4">যোগাযোগ</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:contact@bengaliliterature.com"
                  className="text-ink-100 hover:text-saffron-300 transition-colors flex items-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  contact@bengaliliterature.com
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/bengaliliterature"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-100 hover:text-saffron-300 transition-colors flex items-center"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  @bengaliliterature
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/bengaliliterature"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-100 hover:text-saffron-300 transition-colors flex items-center"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream-200 mt-8 pt-8 text-center text-ink-50 text-sm bengali-text">
          <p>© {new Date().getFullYear()} বাংলা সাহিত্য। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
}