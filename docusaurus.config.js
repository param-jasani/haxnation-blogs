// @ts-check
// docusaurus.config.js — Haxnation Blog Platform
// Trial repo: haxnation/blog
// Production: Haxnation/blog

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Haxnation Blog',
  tagline: 'Insights, Research & Community from Haxnation',
  favicon: 'img/favicon.svg',

  // ── GitHub Pages deployment ──────────────────────────────────────
  // Trial: haxnation.github.io/blog
  // Production: change to 'https://blog.Haxnation.org' and baseUrl: '/'
  url: 'https://haxnation.github.io',
  baseUrl: '/blog/',

  organizationName: 'haxnation',  // GitHub org/user owning the repo
  projectName: 'blog',     // Repo name
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Docusaurus 3.10+ — moved from top-level onBrokenMarkdownLinks
  markdown: {
    format: 'md',
  },

  // ── Internationalisation ─────────────────────────────────────────
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // ── Presets ──────────────────────────────────────────────────────
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        // ── Docs DISABLED — blog-only setup ──
        docs: false,

        // ── Blog configuration ────────────────────────────────────
        blog: {
          // Blog is served at the root path
          routeBasePath: '/',
          showReadingTime: true,
          readingTime: ({ content, frontMatter, defaultReadingTime }) =>
            defaultReadingTime({ content, options: { wordsPerMinute: 200 } }),

          // Feed generation
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} Haxnation. All rights reserved.`,
            createFeedItems: async (params) => {
              const { blogPosts, defaultCreateFeedItems, ...rest } = params;
              return defaultCreateFeedItems({
                blogPosts: blogPosts.filter((item, index) => index < 20),
                ...rest,
              });
            },
          },

          // Posts are authored inside blog/<github-username>/
          // Docusaurus treats the blog/ dir recursively
          blogTitle: 'Haxnation Blog',
          blogDescription:
            'The official Haxnation community blog — cybersecurity, dev culture, and beyond.',
          postsPerPage: 10,
          blogSidebarTitle: 'Recent Posts',
          blogSidebarCount: 10,
        },

        theme: {
          customCss: './src/css/custom.css',
        },

        // ── Sitemap ───────────────────────────────────────────────
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      }),
    ],
  ],

  // ── Theme configuration ───────────────────────────────────────────
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // ── Color mode (dark/light toggle) ────────────────────────
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },

      // ── Announcement bar ──────────────────────────────────────
      announcementBar: {
        id: 'welcome',
        content:
          '🚀 Welcome to the <strong>Haxnation Blog</strong> — Want to contribute? <a href="https://github.com/haxnation/blog/blob/main/CONTRIBUTING.md" target="_blank">Read the guidelines</a>',
        backgroundColor: 'var(--hax-accent)',
        textColor: '#fff',
        isCloseable: true,
      },

      // ── Navbar ────────────────────────────────────────────────
      navbar: {
        title: 'Haxnation',
        logo: {
          alt: 'Haxnation Logo',
          src: 'img/logo.svg',
          srcDark: 'img/logo-dark.svg',
        },
        hideOnScroll: false,
        items: [
          { to: '/', label: 'Blog', position: 'left' },
          { to: '/tags', label: 'Tags', position: 'left' },
          { to: '/archive', label: 'Archive', position: 'left' },
          {
            href: 'https://Haxnation.org',
            label: 'Main Site',
            position: 'right',
          },
          {
            href: 'https://github.com/haxnation/blog',
            label: 'GitHub',
            position: 'right',
            className: 'navbar-github-link',
          },
          {
            type: 'html',
            position: 'right',
            value: `<a class="navbar__cta-btn" href="https://github.com/haxnation/blog/blob/main/CONTRIBUTING.md" target="_blank">✍️ Write a Post</a>`,
          },
        ],
      },

      // ── Footer ────────────────────────────────────────────────
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Blog',
            items: [
              { label: 'All Posts', to: '/' },
              { label: 'Tags', to: '/tags' },
              { label: 'Archive', to: '/archive' },
            ],
          },
          {
            title: 'Community',
            items: [
              { label: 'Haxnation.org', href: 'https://Haxnation.org' },
              { label: 'GitHub', href: 'https://github.com/haxnation/blog' },
              { label: 'Discord', href: 'https://discord.gg/Haxnation' },
            ],
          },
          {
            title: 'Contribute',
            items: [
              {
                label: 'Writing Guidelines',
                href: 'https://github.com/haxnation/blog/blob/main/CONTRIBUTING.md',
              },
              {
                label: 'Fork & Submit PR',
                href: 'https://github.com/haxnation/blog/fork',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Haxnation. Built with Docusaurus.`,
      },

      // ── Prism syntax highlighting ──────────────────────────────
      prism: {
        theme: prismThemes.dracula,
        darkTheme: prismThemes.dracula,
        additionalLanguages: [
          'bash', 'yaml', 'json', 'python', 'javascript',
          'typescript', 'rust', 'go', 'c', 'cpp',
        ],
      },

      // ── Open Graph / SEO metadata ─────────────────────────────
      metadata: [
        { name: 'keywords', content: 'Haxnation, blog, cybersecurity, hacking, development' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'og:type', content: 'website' },
      ],

      // ── Algolia search (configure when ready) ─────────────────
      // algolia: {
      //   appId: 'YOUR_APP_ID',
      //   apiKey: 'YOUR_SEARCH_API_KEY',
      //   indexName: 'blog',
      //   contextualSearch: true,
      // },
    }),
};

export default config;
