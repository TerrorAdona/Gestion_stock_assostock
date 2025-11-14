import { Product } from '@/type'
import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import { readProducts, replenishStockWithTransaction } from '../actions'
import ProductComponent from './ProductComponent'
import { toast } from 'react-toastify'

const Stock = () => {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

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

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    setSelectedProduct(product || null)
    setSelectedProductId(productId)
  }

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault()
    if(!selectedProductId || quantity <= 0){
      toast.error("Données non valides (Tsy mety io eh Jereo tsara)")
      return
    }
    try {
      if (email) {
        await replenishStockWithTransaction(selectedProductId, quantity, email)
      }
      toast.success("Milamina tsara !! (succès)")
      fetchProducts()
      setSelectedProductId('')
      setQuantity(100)
      setSelectedProduct(null)
      const modal = (document.getElementById("my_modal_stock") as HTMLDialogElement)
      if(modal){
        modal.close()
        fetchProducts()
      }
    } catch (error) {
      console.error(error)
    }
  }
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

          <form className='space-y-2' onSubmit={handleSubmit}>
            <label className="block">Selectionner le produit à alimenter</label>
            <select name="" id="" className='select select-bordered' required onChange={(e) => handleProductChange(e.target.value)}>
              <option value="">Selectionner le produit</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} - {p.categoryName}</option>
              ))}
            </select>
            {selectedProduct && (
              <ProductComponent product={selectedProduct} />
            )}

            <label className='block'>Quantité à ajouter</label>
            <input type="number" className="input input-bordered w-full" placeholder='Quantité à ajouter' value={quantity} required
              onChange={(e) => setQuantity(Number(e.target.value))}
            />

            <button className='btn btn-primary w-fit' type='submit'>
              Ajouter au stock
            </button>
          </form>
        </div>
      </dialog>
    </div>
  )
}

export default Stock