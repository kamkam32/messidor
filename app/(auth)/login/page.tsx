'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const supabase = useMemo(() => createClient(), [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: 'Connexion réussie',
        status: 'success',
        duration: 3000,
      })

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      toast({
        title: 'Erreur de connexion',
        description: err.message || 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex minH="100vh" w="full">
      {/* Left side - Image */}
      <Box
        position="relative"
        flex="1"
        display={{ base: 'none', lg: 'block' }}
      >
        <Image
          src="/images/loginmessidor.jpg"
          alt="Messidor Patrimoine"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.400"
          display="flex"
          alignItems="flex-end"
          p={12}
        >
          <VStack align="flex-start" spacing={3}>
            <Heading size="2xl" color="white">
              Messidor Patrimoine
            </Heading>
            <Text fontSize="xl" color="whiteAlpha.900">
              Investissez dans votre avenir
            </Text>
          </VStack>
        </Box>
      </Box>

      {/* Right side - Login Form */}
      <Flex
        flex="1"
        align="center"
        justify="center"
        bg="white"
        p={8}
      >
        <Box w="full" maxW="md">
          <VStack spacing={8} align="stretch">
            <VStack spacing={2} align="flex-start">
              <Heading size="xl" color="brand.800">
                Bienvenue
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Connectez-vous à votre espace client
              </Text>
            </VStack>

            <form onSubmit={handleLogin}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    size="lg"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Mot de passe</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    size="lg"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="accent"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Connexion..."
                >
                  Se connecter
                </Button>
              </VStack>
            </form>

            <Text fontSize="sm" color="gray.600" textAlign="center">
              Pas encore de compte ?{' '}
              <Link href="/signup" style={{ color: '#0EA5E9', fontWeight: '600' }}>
                Créer un compte
              </Link>
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  )
}
