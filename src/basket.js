import { createContext, useContext } from 'react'

// 询价篮 Context（ShopLayout 提供读写，商城/详情/选样页消费）
export const BasketCtx = createContext(null)
export const useBasket = () => useContext(BasketCtx)
