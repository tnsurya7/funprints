import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
  }
}

export interface Order {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    image: string;
    logo?: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'verified' | 'failed';
  orderStatus: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export function saveOrder(order: Order): void {
  ensureDataDir();
  const orders = getAllOrders();
  orders.push(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

export function getAllOrders(): Order[] {
  ensureDataDir();
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getOrderById(orderId: string): Order | null {
  const orders = getAllOrders();
  return orders.find(o => o.orderId === orderId) || null;
}

export function updateOrderStatus(
  orderId: string,
  orderStatus: Order['orderStatus'],
  paymentStatus?: Order['paymentStatus']
): boolean {
  ensureDataDir();
  const orders = getAllOrders();
  const index = orders.findIndex(o => o.orderId === orderId);
  
  if (index === -1) return false;
  
  orders[index].orderStatus = orderStatus;
  if (paymentStatus) {
    orders[index].paymentStatus = paymentStatus;
  }
  orders[index].updatedAt = new Date().toISOString();
  
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  return true;
}
