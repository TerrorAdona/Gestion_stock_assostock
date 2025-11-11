"use client"
import React, { useState } from 'react'
import Wrapper from '../components/Wrapper'
import CategoryModal from '../components/CategoryModal'
import { useUser } from '@clerk/nextjs'
import { createCategory } from '../actions'
import { toast } from 'react-toastify'
import ThemeSwitcher from '../components/ThemeSwitcher'

const page = () => {

    const {user} = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [editMode, setEditMode] = useState(false)

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
        closeCreateModal()
        setLoading(false)
        toast.success("Catégorie crée avec succès.")
    }
    const handleUpdateCategory = async () => {
        setLoading(true)
        if (email) {
            await createCategory(name, email, description)
        }
        closeCreateModal()
        setLoading(false)
        toast.success("Catégorie crée avec succès.")
    }

    return (
        <Wrapper>
            <div>
                <div className='mb-4'>
                    <button className='btn btn-primary' onClick={openCreateModal}>
                        Ajouter une catégorie
                    </button>
                </div>
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