'use client'

import { Box, VStack, Link, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  headings: Heading[]
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Ajouter des IDs aux titres dans le DOM en trouvant le bon élément par son texte
    headings.forEach(heading => {
      const allHeadings = Array.from(document.querySelectorAll(`h${heading.level}`))
      const element = allHeadings.find(el =>
        el.textContent?.trim() === heading.text.trim()
      )
      if (element && !element.id) {
        element.id = heading.id
      }
    })

    // Observer pour détecter quel titre est visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0% -35% 0%' }
    )

    // Observer tous les titres
    headings.forEach(heading => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [headings])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 100
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  if (headings.length === 0) return null

  return (
    <Box
      position="sticky"
      top="120px"
      maxH="calc(100vh - 140px)"
      overflowY="auto"
      p={6}
      bg="gray.50"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      sx={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          bg: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          bg: 'gray.300',
          borderRadius: 'full',
        },
      }}
    >
      <Text fontSize="sm" fontWeight="bold" mb={4} color="gray.700" textTransform="uppercase">
        Dans cet article
      </Text>
      <VStack align="stretch" spacing={2}>
        {headings.map((heading) => (
          <Link
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => handleClick(e, heading.id)}
            fontSize="sm"
            color={activeId === heading.id ? 'purple.600' : 'gray.600'}
            fontWeight={activeId === heading.id ? 'semibold' : 'normal'}
            pl={heading.level === 3 ? 4 : 0}
            py={1}
            borderLeft={activeId === heading.id ? '3px solid' : '3px solid transparent'}
            borderColor={activeId === heading.id ? 'purple.600' : 'transparent'}
            transition="all 0.2s"
            _hover={{
              color: 'purple.600',
              textDecoration: 'none',
              pl: heading.level === 3 ? 5 : 1,
            }}
            sx={{
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {heading.text}
          </Link>
        ))}
      </VStack>
    </Box>
  )
}
