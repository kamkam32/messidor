'use client'

import { useMemo } from 'react'
import { Box, VStack, Flex, Text, Icon, Button, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, IconButton, useDisclosure } from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FiHome, FiTrendingUp, FiBarChart2, FiSliders, FiLogOut, FiActivity, FiMenu } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const menuItems = [
  { name: 'OPCVM', href: '/dashboard/opcvm', icon: FiTrendingUp },
  { name: 'OPCI', href: '/dashboard/opci', icon: FiBarChart2 },
  { name: 'Simulateur', href: '/dashboard/simulateur', icon: FiSliders },
  { name: 'Bourse', href: '/dashboard/bourse', icon: FiActivity },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const SidebarContent = () => (
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
                onClick={onClose}
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
  )

  return (
    <>
      {/* Mobile Menu Button - Fixed */}
      <Box
        position="fixed"
        top={4}
        left={4}
        zIndex={999}
        display={{ base: 'block', lg: 'none' }}
      >
        <IconButton
          icon={<FiMenu />}
          onClick={onOpen}
          variant="solid"
          colorScheme="gray"
          aria-label="Ouvrir le menu"
          size="lg"
          boxShadow="md"
        />
      </Box>

      {/* Desktop Sidebar */}
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
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Menu
          </DrawerHeader>
          <DrawerBody p={0}>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
