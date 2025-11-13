import React, { useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs'
import { Product } from '@/type'

const page = () => {
    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string
    
    const [products, setProducts] = useState<Product[]>([])
    const fetchProduct = async () => {
        try {
            
        } catch (error) {
            console.error(error)
        }
    }
  return (
    <Wrapper>
        Test
    </Wrapper>
  )
}

export default page