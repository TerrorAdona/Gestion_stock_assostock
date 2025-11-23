"use server"

import prisma from "@/lib/prisma"
import { FormDataType, OrderItem } from "@/type"
import { Category, Product } from "@prisma/client"
import { error } from "console"

export async function checkAndAddAssociation(email: string, name: string) {
    if (!email) return
    try {
        const existingAssociation = await prisma.association.findUnique({
            where: {
                email
            }
        })
        if (!existingAssociation && name) {
            await prisma.association.create({
                data: {
                    email, name
                }
            })
        }

    } catch (error) {
        console.error(error)
    }
}

export async function getAssociation(email: string) {
    if (!email) return
    try {
        const existingAssociation = await prisma.association.findUnique({
            where: {
                email
            }
        })
        return existingAssociation
    } catch (error) {
        console.error(error)
    }
}

export async function createCategory(
    name: string,
    email: string,
    description?: string
) {
    if (!name) return
    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.")
        }
        await prisma.category.create({
            data: {
                name,
                description: description || "",
                associationId: association.id
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function updateCategory(
    id: string,
    email: string,
    name: string,
    description?: string
) {
    if (!id || !email || !name) {
        throw new Error("Id, email ou nom de la catégorie requis pour la modification.")
    }
    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.")
        }

        await prisma.category.update({
            where: {
                id: id,
                associationId: association.id
            },
            data: {
                name,
                description: description || "",
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function deleteCategory(id: string, email: string) {
    if (!id || !email) {
        throw new Error("Id, email requis pour la suppression.")
    }
    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.")
        }

        await prisma.category.delete({
            where: {
                id: id,
                associationId: association.id
            },
        })
    } catch (error) {
        console.error(error)
    }
}

export async function readCategory(email: string): Promise<Category[] | undefined> {
    if (!email) {
        throw new Error("Id requis pour l'affichage.")
    }
    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.")
        }

        const cat = await prisma.category.findMany({
            where: {
                associationId: association.id
            },
        })
        return cat
    } catch (error) {
        console.error(error)
    }
}

export async function createProduct(formData: FormDataType, email: string) {
    try {
        const { name, description, price, imageUrl, categoryId, unit } = formData
        if (!email || !price || !categoryId) {
            throw new Error("Misy tsy ampy azafady")
        }
        const safeImageUrl = imageUrl || ""
        const safeUnit = unit || ""
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.")
        }

        await prisma.product.create({
            data: {
                name,
                description,
                price: Number(price),
                imageUrl: safeImageUrl,
                categoryId,
                unit: safeUnit,
                associationId: association.id
            }
        }
        )
    } catch (error) {
        console.error(error)
    }
}

export async function updateProduct(formData: FormDataType, email: string) {
    try {
        const { id, name, description, price, imageUrl } = formData
        if (!email || !price || !id) {
            throw new Error("Misy tsy ampy azafady")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.")
        }

        await prisma.product.update({
            where: {
                id: id,
                associationId: association.id
            },
            data: {
                name,
                description,
                price: Number(price),
                imageUrl: imageUrl
            }
        }
        )
    } catch (error) {
        console.error(error)
    }
}

export async function deleteProduct(id: string, email: string) {
    try {
        if (!id) {
            throw new Error("Misy tsy ampy azafady")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.")
        }

        await prisma.product.delete({
            where: {
                id: id,
                associationId: association.id
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function readProducts(email: string): Promise<Product[] | undefined> {
    try {
        if (!email) {
            throw new Error("Misy tsy ampy azafady (email requis)")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.")
        }

        const p = await prisma.product.findMany({
            where: {
                associationId: association.id
            },
            include: {
                category: true
            }
        })
        return p.map(product => ({
            ...product,
            categoryName: product.category?.name
        }))
    } catch (error) {
        console.error(error)
    }
}

export async function readProductById(productId: string, email: string): Promise<Product | undefined> {
    try {
        if (!email) {
            throw new Error("Misy tsy ampy azafady (email requis)")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.")
        }

        const product = await prisma.product.findUnique({
            where: {
                id: productId,
                associationId: association.id
            },
            include: {
                category: true
            }
        })

        if (!product) {
            return undefined
        }

        return {
            ...product,
            categoryName: product.category?.name
        }
    } catch (error) {
        console.error(error)
    }
}

export async function replenishStockWithTransaction(productId: string, quantity: number, email: string) {
    try {
        if (quantity <= 0) {
            throw new Error("Quantité à ajouter doit être strictement supérieur à zéro (Merci ty)")
        }
        if (!email) {
            throw new Error("Misy tsy ampy azafady (email requis)")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.")
        }

        await prisma.product.update({
            where: {
                id: productId,
                associationId: association.id
            },
            data: {
                quantity: {
                    increment: quantity
                }
            }
        })
        await prisma.transaction.create({
            data: {
                type: "IN",
                quantity: quantity,
                productId: productId,
                associationId: association.id
            }
        })

    } catch (error) {
        console.error(error)
    }
}

export async function donStockTransaction(orderItems: OrderItem[], email: string) {
    try {
        if (!email) {
            throw new Error("Misy tsy ampy azafady (email requis)")
        }
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.")
        }

        for (const item of orderItems) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId }
            })

            if (!product) {
                throw new Error(`Produit avec l'ID ${item.productId} introuvable`)
            }

            if (item.quantity <= 0) {
                throw new Error(`La quantité demandée pour "${product.name}" doit être supérieur à zéro`)
            }

            if (product.quantity < item.quantity) {
                throw new Error(`Stock insuffisant. Reste de stock dispo : ${product.quantity}`)
            }
        }

        await prisma.$transaction(async (tx) => {
            for (const item of orderItems) {
                await tx.product.update({
                    where: {
                        id: item.productId,
                        associationId: association.id
                    },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        }
                    }
                });
                await tx.transaction.create({
                    data: {
                        type: "OUT",
                        quantity: item.quantity,
                        productId: item.productId,
                        associationId: association.id
                    }
                })
            }
        })
        return { success: true }


    } catch (error) {
        console.error(error)
        return { success: false, message: error }
    }
}