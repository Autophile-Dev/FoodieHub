export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  discount?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  banner?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Table {
  id: string;
  label: string;
  waiter: string;
  items: number;
  status: 'Kitchen' | 'Process';
}
