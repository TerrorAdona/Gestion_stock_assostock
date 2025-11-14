"use client"

import { ListTree, Icon, PackagePlus, Boxes, Menu, X, ShoppingBasket, Warehouse } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { checkAndAddAssociation } from '../actions'
import ThemeSwitcher from './ThemeSwitcher'
import Stock from './Stock'

const NavBar = () => {

    const { user } = useUser()
    console.log(user?.primaryEmailAddress?.emailAddress)

    const pathname = usePathname()
    const [menuOpen, setmenuOpen] = useState(false)

    const navLinks = [
        { href: "/products", label: "Liste des produits", icon: ShoppingBasket },
        { href: "/category", label: "Catégories", icon: PackagePlus },
        { href: "/new-product", label: "Nouveau produit", icon: ListTree }

    ]

    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress && user.fullName) {
            checkAndAddAssociation(user?.primaryEmailAddress?.emailAddress, user.fullName)
        }
    }, [user])


    const renderLinks = (baseClass: String) => (
        <>
            {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href
                const activeClass = isActive ? 'btn-primary' : 'btn-ghost'
                return (
                    <Link href={href} key={href} className={`${baseClass} ${activeClass} btn-sm flex gap-2 items-center`}>
                        <Icon className='h-4 w-4' />
                        {label}
                    </Link>
                )
            })}

            <button className="btn btn-sm" onClick={() => (document.getElementById('my_modal_stock') as HTMLDialogElement).showModal()}>
                <Warehouse 
                className='h-4 w-4'/>
                Alimenter le Stock
            </button>
        </>
    )

    return (
        <div className='border-b border-base-300 px-5 md:px-[10%] py-4 relative'>
            <div className='flex justify-between items-center'>
                <div className='flex items-center'>
                    <div className='p-2'>
                        <Boxes className='h-6 w-6 text-primary' />
                    </div>
                    <span className='text-xl'>Stockeo<span className='text-error font-bold'>Izy</span></span>
                </div>

                <button className='btn w-fit sm:hidden btn-sm' onClick={() => setmenuOpen(!menuOpen)}>
                    <Menu className="w-4 h-4" />
                </button>

                <div className='hidden space-x-2 sm:flex items-center'>
                    {renderLinks("btn")}
                    <UserButton />
                </div>
            </div>

            <div className={`absolute top-0 w-full bg-base-100 h-screen flex flex-col gap-2 p-4 transition-all duration-300 sm:hidden z-50 ${menuOpen ? "left-0" : "-left-full"}`}>
                <div className='flex justify-between'>
                    <UserButton />
                    <button className='btn w-fit sm:hidden btn-sm' onClick={() => setmenuOpen(!menuOpen)}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
                {renderLinks("btn")}
            </div>
            <Stock />
        </div>
    )
}

export default NavBar