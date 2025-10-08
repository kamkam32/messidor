'use client'

import { Box, Heading, Text, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Card, CardBody } from '@chakra-ui/react'
import { FiTrendingUp, FiDollarSign, FiPieChart } from 'react-icons/fi'

export default function DashboardPage() {
  return (
    <Box>
      <Box mb={8}>
        <Heading size="xl" mb={2}>
          Tableau de bord
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Bienvenue sur votre espace client Messidor Patrimoine
        </Text>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel display="flex" alignItems="center" gap={2}>
                <FiDollarSign />
                Valeur du portefeuille
              </StatLabel>
              <StatNumber>0 MAD</StatNumber>
              <StatHelpText>Aucun investissement pour le moment</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel display="flex" alignItems="center" gap={2}>
                <FiTrendingUp />
                Performance totale
              </StatLabel>
              <StatNumber>0%</StatNumber>
              <StatHelpText>Depuis le début</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel display="flex" alignItems="center" gap={2}>
                <FiPieChart />
                Nombre de fonds
              </StatLabel>
              <StatNumber>0</StatNumber>
              <StatHelpText>OPCVM et OPCI</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Quick Actions */}
      <Box>
        <Heading size="md" mb={4}>
          Commencer à investir
        </Heading>
        <Text color="gray.600">
          Explorez nos fonds OPCVM et OPCI ou utilisez notre simulateur pour planifier vos investissements.
        </Text>
      </Box>
    </Box>
  )
}
