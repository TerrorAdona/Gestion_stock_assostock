"use client"
import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs'
import { OrderItem, Product } from '@/type'
import { readProducts } from '../actions'
import ProductComponent from '../components/ProductComponent'
import EmptyState from '../components/EmptyState'

const page = () => {

    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string
    const [products, setProducts] = useState<Product[]>([])
    const [order, setOrder] = useState<OrderItem[]>([])
    const [searchQuery, setSearchQuery] = useState<string>("")
    // const [selectedProduct, setSelectedProduct] = useState<string[]>([])
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
    const fetchProducts = async () => {
        try {
            if (email) {
                const products = await readProducts(email)
                if (products) {
                    setProducts(products)
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (email) {
            fetchProducts()
        }
    }, [email])

    const filteredAvailableProducts = products
        .filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter((product) => !selectedProductIds.includes(product.id))
        .slice(0, 10)

    const handleAddToCart = (product: Product) => {
        setOrder((prevOrder) => {
            const existingProduct = prevOrder.find((item) => item.productId === products.id)
            let updateOrder
            if (existingProduct) {
                updateOrder = prevOrder.map((item) =>
                    item.productId === product.id) ?
                    {
                        ...item,
                        quantity: Math.min(item.quantity + 1, product.quantity)
                    } : item
            } else {
                updateOrder = [
                    ...prevOrder,
                    {
                        productId: product.id,
                        quantity: 1,
                        unit: product.unit,
                        imageUrl: product.imageUrl,
                        name: product.name,
                        availableQuantity: product.quantity,
                    }
                ]
            }

            setSelectedProductIds((prevSelected) => prevSelected.includes(product.id)
                ? prevSelected
                : [...prevSelected, product.id]
            )
            return updateOrder
        })
    }
    return (
        <Wrapper>
            <div className='flex md:flex-row flex-col-reverse'>
                <div className='md:w-1/3'>
                    <input
                        type="text"
                        placeholder='Rechercher un produit ...'
                        className='input input-bordered w-full mb-4'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className='space-y-4'>
                        {filteredAvailableProducts.length > 0 ? (
                            filteredAvailableProducts.map((product, index) => (
                                <ProductComponent
                                    product={product}
                                    key={index}
                                    add={true}
                                    handleAddToCart={handleAddToCart}
                                />
                            ))
                        ) : (
                            <div>
                                <EmptyState
                                    message='Aucun produit disponible'
                                    IconComponent='PackageSearch' />
                            </div>
                        )}
                    </div>
                </div>
                <div className='md:w-2/3 p-4 md:ml-4 mb-4 md:mb-0 h-fit border-2 border-base-200 rounded-3xl overflow-x-auto'>
                    {order.length > 0 ? (
                        <div>
                            tableau
                        </div>
                    ) : (
                        <EmptyState
                                    message='Aucun produit dans le panier'
                                    IconComponent='HandHeart' />
                    )}
                </div>
            </div>
        </Wrapper>
    )
}

export default page