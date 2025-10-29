import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface Heading {
  id: string
  text: string
  level: number
}

export interface BlogPost {
  slug: string
  title: string
  date: string
  author: string
  category: string
  image: string
  excerpt: string
  keywords: string[]
  content: string
  headings: Heading[]
}

export function getAllPosts(): BlogPost[] {
  // Créer le dossier s'il n'existe pas
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug,
        title: data.title || '',
        date: data.date || '',
        author: data.author || '',
        category: data.category || '',
        image: data.image || '',
        excerpt: data.excerpt || '',
        keywords: data.keywords || [],
        content,
        headings: [], // Pas besoin d'extraire les titres pour la liste
      } as BlogPost
    })

  // Trier par date décroissante
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    // Détecter les titres markdown H2 (##) et H3 (###)
    const h2Match = line.match(/^##\s+(.+)$/)
    const h3Match = line.match(/^###\s+(.+)$/)

    if (h2Match && !line.startsWith('###')) {
      const text = h2Match[1].trim()
      const id = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/[^a-z0-9\s-]/g, '') // Enlever caractères spéciaux
        .replace(/\s+/g, '-') // Remplacer espaces par tirets
        .replace(/-+/g, '-') // Remplacer tirets multiples par un seul
      headings.push({ id, text, level: 2 })
    } else if (h3Match) {
      const text = h3Match[1].trim()
      const id = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      headings.push({ id, text, level: 3 })
    }
  }

  return headings
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    // Extraire les titres du markdown
    const headings = extractHeadings(content)

    // Convertir le markdown en HTML avec support des tableaux et HTML brut
    const processedContent = await remark()
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify)
      .process(content)
    const contentHtml = processedContent.toString()

    return {
      slug,
      title: data.title || '',
      date: data.date || '',
      author: data.author || '',
      category: data.category || '',
      image: data.image || '',
      excerpt: data.excerpt || '',
      keywords: data.keywords || [],
      content: contentHtml,
      headings,
    }
  } catch (error) {
    return null
  }
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => fileName.replace(/\.md$/, ''))
}
