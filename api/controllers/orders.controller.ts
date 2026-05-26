import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listOrders(req: Request, res: Response) {
  const userId = (req as any).user?.userId;
  const orders = await prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { items: true } });
  return res.json(orders);
}

export async function createOrder(req: Request, res: Response) {
  const userId = (req as any).user?.userId;
  const { items, deliveryAddress, deliveryDate } = req.body;
  const total = items.reduce((sum: number, i: any) => sum + i.price * i.qty, 0);
  const order = await prisma.order.create({ data: { userId, deliveryAddress, deliveryDate: new Date(deliveryDate), total, status: 'pending', items: { create: items } } });
  return res.status(201).json(order);
}

export async function getOrderStatus(req: Request, res: Response) {
  const { id } = req.params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return res.status(404).json({ error: 'Not found' });
  return res.json(order);
}
