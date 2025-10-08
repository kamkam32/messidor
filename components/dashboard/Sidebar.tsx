'use client'

import { useMemo } from 'react'
import { Box, VStack, Flex, Text, Icon, Button } from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FiHome, FiTrendingUp, FiBarChart2, FiSliders, FiLogOut } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const menuItems = [
  { name: 'OPCVM', href: '/dashboard/opcvm', icon: FiTrendingUp },
  { name: 'OPCI', href: '/dashboard/opci', icon: FiBarChart2 },
  { name: 'Simulateur', href: '/dashboard/simulateur', icon: FiSliders },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Box
      as="aside"
      w="280px"
      minH="100vh"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      position="fixed"
      left={0}
      top={0}
      bottom={0}
      display={{ base: 'none', lg: 'block' }}
    >
      <Flex direction="column" h="full" justify="space-between">
        <Box>
          {/* Logo */}
          <Box
            p={8}
            borderBottom="1px"
            borderColor="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Image
              src="/images/logomessidor.jpg"
              alt="Messidor Patrimoine"
              width={200}
              height={70}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>

          {/* Menu Items */}
          <VStack spacing={1} align="stretch" p={6} mt={4}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Box
                  key={item.href}
                  as={NextLink}
                  href={item.href}
                  px={4}
                  py={3}
                  borderRadius="md"
                  bg={isActive ? 'gray.100' : 'transparent'}
                  color="gray.700"
                  fontWeight={isActive ? '600' : '500'}
                  fontSize="md"
                  _hover={{
                    bg: 'gray.50',
                    textDecoration: 'none',
                  }}
                  transition="all 0.2s"
                  display="flex"
                  alignItems="center"
                  gap={3}
                >
                  <Icon as={item.icon} boxSize={5} />
                  <Text>{item.name}</Text>
                </Box>
              )
            })}
          </VStack>
        </Box>

        {/* Logout Button */}
        <Box p={6} borderTop="1px" borderColor="gray.200">
          <Button
            variant="ghost"
            w="full"
            leftIcon={<FiLogOut />}
            onClick={handleLogout}
            color="gray.600"
            justifyContent="flex-start"
            px={4}
            fontWeight="500"
            _hover={{
              bg: 'gray.50',
              color: 'red.600',
            }}
          >
            Se déconnecter
          </Button>
        </Box>
      </Flex>
    </Box>
  )
}
