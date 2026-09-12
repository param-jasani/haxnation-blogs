/**
 * Swizzled BlogSidebar/Desktop (eject) with a collapse toggle.
 *
 * This is the officially documented way to customize the blog sidebar
 * (Docusaurus has no `blogSidebarCount`-style collapse option — see
 * https://github.com/facebook/docusaurus/discussions/11344).
 * Normally produced by:
 *   npm run swizzle @docusaurus/theme-classic BlogSidebar/Desktop -- --eject
 * Hand-placed here so no dependency install is required; it takes precedence
 * over the theme's component automatically. Re-run the swizzle command after
 * a Docusaurus major upgrade to pick up upstream changes, then re-apply the
 * toggle bits below.
 *
 * Behaviour:
 *  - Expanded (default): mirrors the stock component — title + recent posts.
 *  - Collapsed: sidebar shrinks to a slim rail with an expand button.
 *  - State persists in localStorage (`hax-blog-sidebar-collapsed`).
 *  - The mobile variant is untouched (theme default dropdown).
 */
import React, {useState} from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import {
  useVisibleBlogSidebarItems,
  BlogSidebarItemList,
} from '@docusaurus/plugin-content-blog/client';
import BlogSidebarContent from '@theme/BlogSidebar/Content';

// Mirrors the stock Desktop's ListComponent, but with plain class names.
// (The stock one uses CSS-module classes from its own styles.module.css,
// which this override doesn't ship.) The `blogSidebarItem_hax` class keeps
// the site's existing `[class*='blogSidebarItem']` CSS matching.
function SidebarListComponent({items}) {
  return (
    <BlogSidebarItemList
      items={items}
      ulClassName={clsx('clean-list', 'hax-blog-sidebar-list')}
      liClassName="blogSidebarItem_hax"
      linkClassName="hax-blog-sidebar-link"
      linkActiveClassName="hax-blog-sidebar-link--active"
    />
  );
}

function readStoredCollapsed() {
  // Lazy useState initializer — runs during SSG too, so guard window.
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.localStorage.getItem('hax-blog-sidebar-collapsed') === '1';
  } catch (_) {
    return false;
  }
}

export default function BlogSidebarDesktop({sidebar}) {
  const items = useVisibleBlogSidebarItems(sidebar.items);
  const [isCollapsed, setIsCollapsed] = useState(readStoredCollapsed);

  function toggleCollapsed() {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(
          'hax-blog-sidebar-collapsed',
          next ? '1' : '0',
        );
      } catch (_) {
        // Private mode — ignore.
      }
      return next;
    });
  }

  if (isCollapsed) {
    return (
      <aside
        className="hax-blog-sidebar-collapsed"
        aria-label={translate({
          id: 'theme.blog.sidebar.navAriaLabel',
          message: 'Blog recent posts navigation',
          description: 'The ARIA label for recent posts in the blog sidebar',
        })}>
        <button
          type="button"
          className="hax-blog-sidebar-toggle"
          onClick={toggleCollapsed}
          aria-expanded={false}
          aria-label="Expand Recent Posts sidebar"
          title="Expand Recent Posts">
          [+]
        </button>
      </aside>
    );
  }

  return (
    <aside className="col col--3">
      <nav
        className={clsx('thin-scrollbar', 'hax-blog-sidebar-nav')}
        aria-label={translate({
          id: 'theme.blog.sidebar.navAriaLabel',
          message: 'Blog recent posts navigation',
          description: 'The ARIA label for recent posts in the blog sidebar',
        })}>
        <div
          className={clsx(
            // Keep a `blogSidebarTitle*` class so existing site CSS keeps matching.
            'blogSidebarTitle_hax',
            'margin-bottom--md',
            'hax-blog-sidebar-title',
          )}>
          <span>{sidebar.title}</span>
          <button
            type="button"
            className="hax-blog-sidebar-toggle"
            onClick={toggleCollapsed}
            aria-expanded
            aria-label="Collapse Recent Posts sidebar"
            title="Collapse Recent Posts">
            [-]
          </button>
        </div>
        <BlogSidebarContent
          items={items}
          ListComponent={SidebarListComponent}
          yearGroupHeadingClassName="hax-blog-sidebar-year"
        />
      </nav>
    </aside>
  );
}
