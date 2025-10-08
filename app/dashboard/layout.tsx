import { Box, Flex } from '@chakra-ui/react'
import Sidebar from '@/components/dashboard/Sidebar'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Flex minH="100vh" bg="gray.50">
      <Sidebar />
      <Box flex="1" ml={{ base: 0, lg: '280px' }} p={8}>
        {children}
      </Box>
    </Flex>
  )
}
