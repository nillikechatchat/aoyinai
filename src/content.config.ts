import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

function removeDupsAndLowerCase(array: string[]) {
  if (!array.length) return array
  const lowercaseItems = array.map((str) => str.toLowerCase())
  const distinctItems = new Set(lowercaseItems)
  return Array.from(distinctItems)
}

// Define blog collection
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      // Required
      title: z.string().max(60),
      description: z.string().max(160),
      publishDate: z.coerce.date().optional(),
      // 别名兼容旧 Hugo frontmatter
      date: z.coerce.date().optional(),
      updatedDate: z.coerce.date().optional(),
      updated: z.coerce.date().optional(),
      // Optional
      heroImage: z
        .object({
          src: z.string(),
          alt: z.string().optional(),
          inferSize: z.boolean().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
          color: z.string().optional()
        })
        .optional(),
      // 兼容旧字段：cover 子对象 + image 字符串 + cover 字符串
      cover: z
        .object({
          image: z.string().optional(),
          alt: z.string().optional(),
          hidden: z.boolean().optional()
        })
        .optional(),
      image: z.string().optional(),
      tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
      categories: z.array(z.string()).default([]),
      language: z.string().optional(),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      // Special fields
      comment: z.boolean().default(false)
    }).transform((data) => ({
      ...data,
      // date → publishDate 兼容
      publishDate: data.publishDate ?? data.date ?? new Date(),
      updatedDate: data.updatedDate ?? data.updated
    }))
})

export const collections = { blog }
