"use client"
import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import CategoryModal from '../components/CategoryModal'
import { useUser } from '@clerk/nextjs'
import { createCategory, deleteCategory, readCategory, updateCategory } from '../actions'
import { toast } from 'react-toastify'
import ThemeSwitcher from '../components/ThemeSwitcher'
import { Category } from '@prisma/client'
import EmptyState from '../components/EmptyState'
import { Pencil, Trash } from 'lucide-react'

const page = () => {

    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
    const [categories, setCategories] = useState<Category[]>([])

    const loadCategories = async () => {
        if (email) {
            const data = await readCategory(email)
            if (data)
                setCategories(data)
        }
    }
    useEffect(() => {
        loadCategories()
    }, [email])

    const openCreateModal = () => {
        setName("");
        setDescription("");
        setEditMode(false);
        (document.getElementById("category_modal") as HTMLDialogElement)?.showModal()
    }
    const closeCreateModal = () => {
        setName("");
        setDescription("");
        setEditMode(false);
        (document.getElementById("category_modal") as HTMLDialogElement)?.close()
    }

    const handleCreateCategory = async () => {
        setLoading(true)
        if (email) {
            await createCategory(name, email, description)
        }
        await loadCategories()
        closeCreateModal()
        setLoading(false)
        toast.success("Catégorie crée avec succès.")
    }
    const handleUpdateCategory = async () => {
        if (!editingCategoryId) return
        setLoading(true)
        if (email) {
            await updateCategory(editingCategoryId, email, name, description)
        }
        await loadCategories()
        closeCreateModal()
        setLoading(false)
        toast.success("Catégorie mis a jour avec succès.")
    }

    const openEditModal = (category: Category) => {
        setName(category.name);
        setDescription(category.description || "");
        setEditMode(true);
        setEditingCategoryId(category.id);
        (document.getElementById("category_modal") as HTMLDialogElement)?.showModal()
    }

    // const deleteModal = async (category : Category) => {
    //     setLoading(true)
    //     const confirmDelete = confirm("Tena matotra ah ? Miala avokoa ireo \"produit\" rehetra mifanaraka aminy.")
    //     if (!confirmDelete) return
    //     await deleteCategory(category.id , email)
    //     await loadCategories()
    //     setLoading(false)
    //     toast.success("Catégorie supprimé avec succès.")
    // }

    const handleDeleteCategory = async (categoryId: string) => {
        const confirmDelete = confirm("Tena matotra ah ? Miala avokoa ireo \"produit\" rehetra mifanaraka aminy.")
        if (!confirmDelete) return
        await deleteCategory(categoryId, email)
        await loadCategories()
        toast.success("Catégorie supprimé avec succès.")
    }


    return (
        <Wrapper>
            <div>
                <div className='mb-4'>
                    <button className='btn btn-primary' onClick={openCreateModal}>
                        Ajouter une catégorie
                    </button>
                </div>

                {categories.length > 0 ? (
                    <div>
                        {categories.map((category) => (
                            <div key={category.id} className='mb-2 p-5 border-2 border-base-200 rounded-3xl flex justify-between items-center'>
                                <div>
                                    <strong className='text-lg'>{category.name}</strong>
                                    <div className='text-sm'>
                                        {category.description}
                                    </div>
                                </div>
                                <div className='flex gap-2'>
                                    <button className='btn btn-sm' onClick={() => openEditModal(category)}>
                                        <Pencil className='w-4 h-4' />Modifier
                                    </button>
                                    <button className='btn btn-sm btn-error' onClick={() => handleDeleteCategory(category.id)}>
                                        <Trash className='w-4 h-4' />Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        message={'Aucune catégorie disponible'}
                        IconComponent='Group' />
                )}
            </div>

            <CategoryModal
                name={name}
                description={description}
                loading={loading}
                onclose={closeCreateModal}
                onChangeName={setName}
                onChangeDescription={setDescription}
                onSubmit={editMode ? handleUpdateCategory : handleCreateCategory}
                editMode={editMode}
            />
        </Wrapper>

    )
}

export default page