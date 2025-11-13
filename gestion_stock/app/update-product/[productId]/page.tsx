"use client"
import { useUser } from '@clerk/nextjs'
import { FormDataType, Product } from '@/type'
import React, { useEffect, useState } from 'react'
import { readProductById } from '@/app/actions'
import Wrapper from '@/app/components/Wrapper'

const page = ({ params }: { params: Promise<{ productId: string }> }) => {

    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string
    const [product, setProduct] = useState<Product | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [formData, setFormData] = useState<FormDataType>({
        id: "",
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        categoryName: ""
    })

    const fetchProduct = async () => {
        try {
            const { productId } = await params
            if (email) {
                const fetchedProduct = await readProductById(productId, email)
                if (fetchedProduct) {
                    setProduct(fetchedProduct)
                    setFormData({
                        id: fetchedProduct.id,
                        name: fetchedProduct.name,
                        description: fetchedProduct.description,
                        price: fetchedProduct.price,
                        imageUrl: fetchedProduct.imageUrl,
                        categoryName: fetchedProduct.categoryName
                    })
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchProduct()
    }, [email])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null
        setFile(selectedFile)
        if (selectedFile) {
            setPreviewUrl(URL.createObjectURL(selectedFile))
        }
    }
    return (
        <Wrapper>
            <div>
                {product ? (
                    <div>
                        <h1 className='text-2xl font-bold mb-4'>
                            Mise à jour du produit {product.name}
                        </h1>
                        <div className='flex md:flex-row flex-col md:items-center'>
                            <form className='space-y-2'>
                                <div className='text-sm font-semibold mb-2'>
                                    Nom
                                </div>
                                <input
                                    type="text"
                                    name='name'
                                    placeholder='Nom'
                                    className='input input-bordered w-full'
                                    value={formData.name}
                                    onChange={handleInputChange} />

                                <div className='text-sm font-semibold mb-2'>
                                    Description
                                </div>

                                <textarea
                                    name="description"
                                    id=""
                                    placeholder='Description'
                                    className='textarea textarea-bordered w-full'
                                    value={formData.description}
                                    onChange={handleInputChange}>
                                </textarea>

                                <div className='text-sm font-semibold mb-2'>
                                    Catégorie
                                </div>
                                <input
                                    type="text"
                                    name='categoryName'
                                    placeholder='Categorie'
                                    className='input input-bordered w-full validator'
                                    value={formData.categoryName}
                                    disabled
                                />

                                <div className='text-sm font-semibold mb-2'>
                                    Imgae / Prix Unitaire
                                </div>
                                <div className='flex'>
                                    <input
                                        type="file"
                                        accept='image/*'
                                        placeholder='Prix'
                                        className='file-input file-input-bordered w-full validator'
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        type="number"
                                        name='price'
                                        placeholder='Prix'
                                        className='ml-4 input input-bordered w-full validator'
                                        value={formData.price}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <button type='submit' className='mt-3 btn btn-primary'>
                                    Modifier le produit
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className='flex justify-center items-center'>
                        {/* <span className="loading loading-spinner loading-xl"></span> */}
                        <span className="loading loading-bars loading-xl"></span>
                    </div>
                )}
            </div>
        </Wrapper>
    )
}

export default page