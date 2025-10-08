'use client'

import { useState } from 'react'
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
  Divider,
  HStack,
  SimpleGrid,
} from '@chakra-ui/react'
import { FcGoogle } from 'react-icons/fc'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
          },
        },
      })

      if (error) throw error

      toast({
        title: 'Inscription réussie',
        description: 'Bienvenue sur Messidor Patrimoine !',
        status: 'success',
        duration: 3000,
      })

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      toast({
        title: 'Erreur d\'inscription',
        description: err.message || 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      toast({
        title: 'Erreur d\'inscription',
        description: err.message || 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
      })
      setGoogleLoading(false)
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

      {/* Right side - Signup Form */}
      <Flex
        flex="1"
        align="center"
        justify="center"
        bg="white"
        p={8}
        overflowY="auto"
      >
        <Box w="full" maxW="md" py={8}>
          <VStack spacing={6} align="stretch">
            <VStack spacing={2} align="flex-start">
              <Heading size="xl" color="brand.800">
                Créer un compte
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Rejoignez Messidor Patrimoine
              </Text>
            </VStack>

            <VStack spacing={4}>
              <Button
                w="full"
                size="lg"
                variant="outline"
                leftIcon={<FcGoogle size={24} />}
                onClick={handleGoogleSignup}
                isLoading={googleLoading}
                loadingText="Connexion..."
                borderColor="gray.300"
                _hover={{ bg: 'gray.50' }}
              >
                Continuer avec Google
              </Button>

              <HStack w="full">
                <Divider />
                <Text fontSize="sm" color="gray.500" whiteSpace="nowrap" px={2}>
                  ou par email
                </Text>
                <Divider />
              </HStack>
            </VStack>

            <form onSubmit={handleSignup}>
              <VStack spacing={4}>
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Prénom</FormLabel>
                    <Input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jean"
                      size="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Nom</FormLabel>
                    <Input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dupont"
                      size="lg"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl isRequired>
                  <FormLabel>Téléphone</FormLabel>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    size="lg"
                  />
                </FormControl>

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
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Minimum 6 caractères
                  </Text>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="accent"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Création..."
                >
                  Créer mon compte
                </Button>
              </VStack>
            </form>

            <Text fontSize="sm" color="gray.600" textAlign="center">
              Déjà un compte ?{' '}
              <Link href="/login" style={{ color: '#0EA5E9', fontWeight: '600' }}>
                Se connecter
              </Link>
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  )
}
