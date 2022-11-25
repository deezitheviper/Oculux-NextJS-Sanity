import React,{createContext, useContext, useState, useEffect} from "react";
import {toast} from 'react-hot-toast';
import { client } from "../utils/client";
import Cookies from 'js-cookie';



const Context = createContext();

export const StateContext = ({children}) => {
    const [showCart, setShowCart] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalQuantities, setTotalQuantities] = useState(0);
    const [qty, setQty] = useState(1);
    const [stock, setStock] = useState();


    let foundProduct;
    let index;

    const removeFromCart = (product) => {
        foundProduct = cartItems.find(item => item._id === product._id);
        const newCartItems = cartItems.filter(item => item._id !== product._id)

        setTotalPrice(prevTotalPrice => prevTotalPrice - foundProduct.quantity * foundProduct.price);
        setTotalQuantities(prevTotalQty => prevTotalQty - foundProduct.quantity);
        setCartItems(newCartItems)
        Cookies.remove('cartItems')
        Cookies.remove('totalPrice')
        Cookies.remove('totalQty')
    }

    const updateCartItemQuantity = (id, value) => {
        foundProduct = cartItems.find( item => item._id === id )
        index = cartItems.findIndex(item => item._id === id)
        const newCartItems = cartItems.filter( item => item._id !== id);

        if(value === 'inc'){
        if(foundProduct.quantity < stock){
            const updatedCartItems = [...newCartItems,{...foundProduct, quantity: foundProduct.quantity += 1 }]
            setCartItems(updatedCartItems)
            setTotalPrice(prevTotalPrice => prevTotalPrice + foundProduct.price)
            setTotalQuantities(prevTotalQty => prevTotalQty + 1)
            Cookies.set('totalPrice',JSON.stringify(totalPrice+foundProduct.price),{ expires: 1 })
            Cookies.set('totalQty',JSON.stringify(totalQuantities+1),{ expires: 1 })
            Cookies.set('cartItems',JSON.stringify(updatedCartItems),{ expires: 1 })
        }
        }else if(value === 'dec'){
           
            if(foundProduct.quantity > 1){
            const updatedCartItems = [...newCartItems,{...foundProduct, quantity: foundProduct.quantity -= 1 }]
            setCartItems(updatedCartItems)
            setTotalPrice(prevTotalPrice => prevTotalPrice - foundProduct.price)
            setTotalQuantities(prevTotalQty => prevTotalQty - 1)
            Cookies.set('totalPrice',JSON.stringify(totalPrice-foundProduct.price),{ expires: 1 })
            Cookies.set('totalQty',JSON.stringify(totalQuantities-1),{ expires: 1 })
            Cookies.set('cartItems',JSON.stringify(updatedCartItems),{ expires: 1 })
            
        }
    }
    
    }



    const incQty = () => {
        if(qty < stock){
        setQty(prevQty => prevQty + 1)
        }
    }
    const decQty = () => {
        setQty(prevQty => {
            if(prevQty - 1 < 1) return 1;
            return prevQty - 1
        }
        )
    }

 
    
    const onAdd = (qty, product) => {
       
        
        const checkProductInCart = cartItems.find(item => item._id === product._id)
        
     
        if (checkProductInCart){
          
            setTotalPrice(prevTotalPrice =>
                 prevTotalPrice + qty * product.price
               );
            setTotalQuantities(prevTotalQty => prevTotalQty + qty)

            const updatedCartItems = cartItems.map(cartProduct => {
                if(cartProduct._id === product._id) return {
                    ...cartProduct,
                    quantity: cartProduct.quantity + qty
                }
            })
            setCartItems(updatedCartItems);
            Cookies.set('totalPrice',JSON.stringify(totalPrice+qty * product.price),{ expires: 1 })
            Cookies.set('totalQty',JSON.stringify(totalQuantities+qty),{ expires: 1 })
            Cookies.set('cartItems',JSON.stringify(updatedCartItems),{ expires: 1 })
        }else{
            
            setTotalPrice(prevTotalPrice => prevTotalPrice + qty * product.price);
            setTotalQuantities(prevTotalQty => prevTotalQty + qty)
            product.quantity = qty
            setCartItems([...cartItems, {...product}])
            Cookies.set('totalPrice',JSON.stringify(totalPrice+qty * product.price),{ expires: 1 })
            Cookies.set('totalQty',JSON.stringify(totalQuantities+qty),{ expires: 1 })
            Cookies.set('cartItems',JSON.stringify([...cartItems, {...product}]),{ expires: 1 })
        }
        

        toast.success(`${qty} ${product.name} added to cart`) 
  
    }

    const stockInfo = async (id) => {
        const query = `*[_type == 'product' &&  _id == '${id}'] [0]`
        const product = await client.fetch(query)
       setStock(product.stock)
    }
 

    useEffect(() => {
        setCartItems(Cookies.get('cartItems')?JSON.parse(Cookies.get('cartItems')): [])
        setTotalPrice(Cookies.get('totalPrice')?JSON.parse(Cookies.get('totalPrice')): 0)
        setTotalQuantities(Cookies.get('totalQty')?JSON.parse(Cookies.get('totalQty')): 0)
    }, [])
    return (
        <Context.Provider
            value={{
                stock,
                showCart,
                showSearch,
                cartItems,
                totalPrice,
                totalQuantities,
                qty,
                incQty,
                decQty,
                onAdd,
                setShowSearch,
                setCartItems,
                setTotalPrice,
                setTotalQuantities,
                setShowCart,
                stockInfo,
                updateCartItemQuantity,
                removeFromCart
            }}
        >
            {children}
        </Context.Provider>
    )
}


export const useStateContext = () => useContext(Context)