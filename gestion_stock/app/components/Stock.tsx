import { Product } from '@/type'
import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import { readProducts } from '../actions'

const Stock = () => {
    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string
    const [products, setProducts] = useState<Product[]>([])
    const [selectedProductId , setSelectedProductId] = useState<string>("")
    const [quantity , setQuantity] = useState<number>(0)
    const [selectedProduct , setSelectedProduct] = useState<Product | null>(null)

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
    return (
        <div>
            {/* You can open the modal using document.getElementById('ID').showModal() method */}
            <dialog id="my_modal_stock" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Gestion de Stock</h3>
                    <p className="py-4">Ajoutez des quantités aux produits disponibles dans le stock</p>

                    <form className='space-y-2'>
                        <label>Selectionner le produit à alimenter</label>
                        <select name="" id="" className='select select-bordered' required>
                            <option value=""></option>
                        </select>
                    </form>
                </div>
            </dialog>
        </div>
    )
}

export default Stock