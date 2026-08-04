import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  image: string;
  excerpt: string;
  keywords: string[];
  content: string;
  headings: Heading[];
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) return [];
  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter((f) => f.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fileContents = fs.readFileSync(path.join(postsDirectory, fileName), "utf8");
      const { data, content } = matter(fileContents);
      return {
        slug,
        title: data.title || "",
        date: data.date || "",
        author: data.author || "Équipe Messidor Patrimoine",
        category: data.category || "",
        image: data.image || "",
        excerpt: data.excerpt || "",
        keywords: data.keywords || [],
        content,
        headings: [],
      } as BlogPost;
    });
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  for (const line of content.split("\n")) {
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2 && !line.startsWith("###")) {
      const text = h2[1].trim();
      const id = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      headings.push({ id, text, level: 2 });
    }
  }
  return headings;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fileContents = fs.readFileSync(path.join(postsDirectory, `${slug}.md`), "utf8");
    const { data, content } = matter(fileContents);
    const headings = extractHeadings(content);
    const processed = await remark()
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify)
      .process(content);
    return {
      slug,
      title: data.title || "",
      date: data.date || "",
      author: data.author || "Équipe Messidor Patrimoine",
      category: data.category || "",
      image: data.image || "",
      excerpt: data.excerpt || "",
      keywords: data.keywords || [],
      content: processed.toString(),
      headings,
    };
  } catch {
    return null;
  }
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}
