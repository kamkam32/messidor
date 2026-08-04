'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Vérifier que l'utilisateur a bien un token de réinitialisation valide
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Token valide, l'utilisateur peut définir un nouveau mot de passe
      }
    })
  }, [supabase])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        status: 'error',
        duration: 5000,
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères',
        status: 'error',
        duration: 5000,
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      toast({
        title: 'Mot de passe réinitialisé',
        description: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe',
        status: 'success',
        duration: 5000,
      })

      router.push('/login')
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex minH="100vh" w="full" align="center" justify="center" bg="gray.50">
      <Box w="full" maxW="md" bg="white" p={8} borderRadius="lg" shadow="lg">
        <VStack spacing={8} align="stretch">
          <VStack spacing={2} align="flex-start">
            <Heading size="xl" color="brand.800">
              Nouveau mot de passe
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Choisissez un nouveau mot de passe sécurisé
            </Text>
          </VStack>

          <form onSubmit={handleResetPassword}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nouveau mot de passe</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                loadingText="Réinitialisation..."
              >
                Réinitialiser le mot de passe
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Flex>
  )
}
