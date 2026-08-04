'use client'

import { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Checkbox,
  useToast,
  Icon,
  Box,
  Heading,
} from '@chakra-ui/react'
import { FaGift, FaEnvelope, FaPhone, FaUser } from 'react-icons/fa'
import { createClient } from '@supabase/supabase-js'

interface LeadCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  simulatorType: string
  simulationData?: any
}

export default function LeadCaptureModal({
  isOpen,
  onClose,
  simulatorType,
  simulationData,
}: LeadCaptureModalProps) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [consentMarketing, setConsentMarketing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: 'Email requis',
        description: 'Veuillez entrer votre email',
        status: 'error',
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Insertion dans Supabase
      const { data, error } = await supabase.from('simulator_leads').insert({
        email,
        phone: phone || null,
        first_name: firstName || null,
        last_name: lastName || null,
        simulator_type: simulatorType,
        simulation_data: simulationData || null,
        consent_marketing: consentMarketing,
        source: 'simulator_modal',
        status: 'new',
      })

      if (error) throw error

      // Sauvegarder dans localStorage pour ne pas redemander
      localStorage.setItem('lead_captured', 'true')
      localStorage.setItem('lead_captured_date', new Date().toISOString())

      toast({
        title: 'Merci !',
        description:
          'Nos experts vous contacteront sous 24h pour un accompagnement personnalisé.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      onClose()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du lead:', error)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
        status: 'error',
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    // Marquer comme "skipped" dans localStorage
    localStorage.setItem('lead_modal_skipped', 'true')
    localStorage.setItem('lead_modal_skipped_date', new Date().toISOString())
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} size="md" isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent mx={4}>
        <ModalHeader>
          <VStack spacing={2} align="center" pt={4}>
            <Box
              bg="accent.100"
              p={3}
              borderRadius="full"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FaGift} boxSize={6} color="accent.600" />
            </Box>
            <Heading size="md" textAlign="center" color="brand.800">
              Obtenez un accompagnement gratuit !
            </Heading>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <Text textAlign="center" color="gray.600" mb={6} fontSize="sm">
            Nos experts en gestion de patrimoine peuvent vous aider à optimiser votre
            stratégie. <strong>Consultation gratuite de 30 min</strong> offerte.
          </Text>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="brand.700">
                  <Icon as={FaEnvelope} mr={2} color="accent.600" />
                  Email
                </FormLabel>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" color="brand.700">
                  <Icon as={FaPhone} mr={2} color="accent.600" />
                  Téléphone (optionnel)
                </FormLabel>
                <Input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" color="brand.700">
                  <Icon as={FaUser} mr={2} color="accent.600" />
                  Prénom (optionnel)
                </FormLabel>
                <Input
                  type="text"
                  placeholder="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" color="brand.700">
                  <Icon as={FaUser} mr={2} color="accent.600" />
                  Nom (optionnel)
                </FormLabel>
                <Input
                  type="text"
                  placeholder="Nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  size="lg"
                />
              </FormControl>

              <Checkbox
                isChecked={consentMarketing}
                onChange={(e) => setConsentMarketing(e.target.checked)}
                size="sm"
                colorScheme="yellow"
              >
                <Text fontSize="xs" color="gray.600">
                  J'accepte de recevoir des conseils et offres personnalisées de Messidor
                  Patrimoine
                </Text>
              </Checkbox>

              <VStack spacing={3} w="full" pt={2}>
                <Button
                  type="submit"
                  colorScheme="yellow"
                  size="lg"
                  width="full"
                  isLoading={isSubmitting}
                  loadingText="Envoi en cours..."
                >
                  Obtenir ma consultation gratuite
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  color="gray.500"
                  _hover={{ color: 'gray.700' }}
                >
                  Non merci, continuer sans accompagnement
                </Button>
              </VStack>

              <Text fontSize="xs" color="gray.500" textAlign="center" pt={2}>
                Vos données sont sécurisées et ne seront jamais partagées avec des tiers.
              </Text>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
