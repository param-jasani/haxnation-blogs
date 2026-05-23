# Contributing to the Haxnation Blog

Thank you for wanting to write for the Haxnation community! This guide explains **exactly** how to submit a blog post.

---

## 📋 Prerequisites

Before you can submit a post, a Haxnation admin must add your GitHub username to the authorized writers list. Open an issue or reach out on Discord to request access.

---

## 🗂️ Repository Structure

```
blog/
├── blog/
│   └── <your-github-username>/   ← YOUR posts go here ONLY
│       └── YYYY-MM-DD-post-title.md
├── blog/authors.yml              ← Author profiles (admin edits only)
├── blog-writers.txt              ← Authorized writers list (admin edits only)
└── ...
```

> ⚠️ **IMPORTANT**: You may ONLY create or edit files inside `blog/<your-exact-github-username>/`.
> Any PR that touches files outside this path will be **automatically rejected**.

---

## ✍️ Step-by-Step Submission

### 1. Fork the Repository

Click the **Fork** button on the [repository page](https://github.com/haxnation/blog) to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/<your-username>/blog.git
cd blog
```

### 3. Install Dependencies (for local preview)

```bash
npm install
npm start
```

This opens a live preview at `http://localhost:3000`.

### 4. Create Your Post

Create a new file at:
```
blog/<your-github-username>/YYYY-MM-DD-your-post-title.md
```

**Example:**
```
blog/haxnation/2025-03-15-my-first-ctf-writeup.md
```

### 5. Use the Required Frontmatter

Every post must start with this YAML frontmatter block:

```markdown
---
slug: my-unique-post-slug
title: Your Post Title
authors: [your-github-username]
tags: [cybersecurity, ctf, tutorial]
date: 2025-03-15T10:00:00.000Z
description: A short one-sentence description for SEO and previews.
---

Your post content here...

<!-- truncate -->

More content below the fold...
```

#### Frontmatter Fields

| Field | Required | Description |
|---|---|---|
| `slug` | ✅ | URL-friendly unique identifier |
| `title` | ✅ | Post title |
| `authors` | ✅ | Your GitHub username (must match `authors.yml`) |
| `tags` | ✅ | At least one tag |
| `date` | ✅ | ISO 8601 date |
| `description` | ✅ | Short summary (for SEO & card preview) |
| `image` | ❌ | Banner image path in `/static/img/blog/` |
| `draft` | ❌ | Set `true` to hide from listing while writing |

### 6. Add Images (Optional)

Place images in `static/img/blog/<your-username>/` and reference them as:
```markdown
![Alt text](/img/blog/your-username/image.png)
```

> ⚠️ Images must also be inside your namespaced folder.

### 7. Submit a Pull Request

```bash
git add .
git commit -m "blog(haxnation): add CTF writeup for HackTheBox - Machines"
git push origin main
```

Then open a **Pull Request** from your fork to `haxnation/blog:main`.

---

## 🤖 Automated Checks

When you open a PR, two automated checks run immediately:

| Check | What it validates |
|---|---|
| 🔑 Author Authorization | Your GitHub username is in the `blog-writers.txt` allow-list |
| 📂 Content Isolation | Every file in your PR is under `blog/<your-username>/` |

If either check fails, the PR will be blocked with a comment explaining why.

---

## 👁️ Review Process

Once automated checks pass, a member of the **blog-reviewers** team will:
1. Review your post for quality, accuracy, and community guidelines
2. Request changes if needed (you can push new commits to update the PR)
3. Approve and merge when ready

**Note**: Even if you're editing your own previous posts, the PR process is mandatory. This ensures quality and prevents accidental regressions.

---

## 📝 Writing Guidelines

- Write clearly and concisely
- Include code examples where relevant (use fenced code blocks with language tags)
- Avoid sharing illegal or harmful content
- Respect others' privacy and intellectual property
- Use `<!-- truncate -->` after your intro to control what shows in the blog listing preview

---

## 💬 Questions?

Open an issue!
