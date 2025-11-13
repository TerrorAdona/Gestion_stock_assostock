"use client"
import { useUser } from '@clerk/nextjs'
import { FormDataType, Product } from '@/type'
import React, { FormEvent, useEffect, useState } from 'react'
import { readProductById, updateProduct } from '@/app/actions'
import Wrapper from '@/app/components/Wrapper'
import ProductImage from '@/app/components/ProductImage'
import { FileImage } from 'lucide-react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

const page = ({ params }: { params: Promise<{ productId: string }> }) => {

    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string
    const [product, setProduct] = useState<Product | null>(null)
    const router = useRouter()
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
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        try {
            // Vérifie si un fichier a été sélectionné
            if (file) {
                // Supprimer l'ancienne image si elle existe
                if (formData?.imageUrl) {
                    const resDelete = await fetch("/api/upload", {
                        method: "DELETE",
                        body: JSON.stringify({ path: formData.imageUrl }),
                        headers: { 'Content-Type': 'application/json' },
                    })

                    const dataDelete = await resDelete.json()
                    if (!dataDelete.success) {
                        throw new Error("Erreur lors de la suppression de l'image.")
                    }
                }

                // Upload du nouveau fichier
                const imageData = new FormData()
                imageData.append("file", file)

                const resUpload = await fetch("/api/upload", {
                    method: "POST",
                    body: imageData,
                })

                const dataUpload = await resUpload.json()
                if (!dataUpload.success) {
                    throw new Error("Erreur lors de l'upload de l'image.")
                }

                // Met à jour le chemin de l'image dans le formulaire
                formData.imageUrl = dataUpload.path
            }

            // Met à jour le produit (même si aucune image n’a été modifiée)
            await updateProduct(formData, email)

            // toast.success("Nilamina tsara !!") // Message de succès
            // router.push("/products") // Redirection après succès
            toast.success("Nilamina tsara !!")
            setTimeout(() => {
                router.push("/products")
            }, 500)



        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Une erreur est survenue.")
        }
    }

    // const handleSubmit = async (e: React.FormEvent) => {
    //     let imageUrl = formData?.imageUrl
    //     e.preventDefault()
    //     try {
    //         if (file) {
    //             const resDelete = await fetch("/api/upload", {
    //                 method: "DELETE",
    //                 body: JSON.stringify({ path: formData.imageUrl }),
    //                 headers: { 'Content-Type': 'application/json' }
    //             })
    //             const dataDelete = await resDelete.json()
    //             if (!dataDelete.success) {
    //                 throw new Error("Erreur lors de la suppression de l'image.")
    //             }
    //             const imageData = new FormData()
    //             imageData.append("file", file)
    //             const res = await fetch("/api/upload", {
    //                 method: "POST",
    //                 body: imageData
    //             })
    //             const data = await res.json()
    //             if (!data.success) {
    //                 throw new Error("Erreur lors de l'upload de l'image.")
    //             }
    //             imageUrl = data.path
    //             formData.imageUrl = imageUrl

    //             await updateProduct(formData, email)
    //             toast.success("Nilamina tsara !!")
    //             router.push("/products")
    //         }
    //     } catch (error : any) {
    //         console.error(error)
    //         toast.error(error.message)
    //     }
    // }
    return (
        <Wrapper>
            <div>
                {product ? (
                    <div>
                        <h1 className='text-2xl font-bold mb-4'>
                            Mise à jour du produit {product.name}
                        </h1>
                        <div className='flex md:flex-row flex-col md:items-center'>
                            <form className='space-y-2' onSubmit={handleSubmit}>
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
                                        onChange={handleFileChange}
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

                            <div className='flex md:flex-col md:ml-4 mt-4 md:mt-0'>
                                <div className='md:ml-4 md:w-[200px] mt-4 md:mt-0 border-2 border-primary md:h-[200px] p-5 justify-center items-center rounded-3xl hidden md:flex'>
                                    {formData.imageUrl && formData.imageUrl !== "" ? (
                                        <div>
                                            <ProductImage
                                                src={formData.imageUrl}
                                                alt={formData.name}
                                                heightClass='h-40'
                                                widthClass='w-40' />
                                        </div>
                                    ) : (
                                        <div className='wiggle-animation'>
                                            <FileImage strokeWidth={1} className='w-10 h-10 text-primary' />
                                        </div>
                                    )}
                                </div>

                                <div className='md:mt-4 w-full md:ml-4 md:w-[200px] mt-4 border-2 border-primary md:h-[200px] p-5 flex justify-center items-center rounded-3xl'>
                                    {previewUrl && previewUrl !== "" ? (
                                        <div>
                                            <ProductImage
                                                src={previewUrl}
                                                alt='preview'
                                                heightClass='h-40'
                                                widthClass='w-40' />
                                        </div>
                                    ) : (
                                        <div className='wiggle-animation'>
                                            <FileImage strokeWidth={1} className='w-10 h-10 text-primary' />
                                        </div>
                                    )}
                                </div>
                            </div>
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