import { NextResponse } from 'next/server'

export async function POST(req) {
  const { plan, userId, email } = await req.json()

  const amount = plan === 'monthly' ? 999 : 9999

  const orderData = {
    order_id: `order_${userId}_${Date.now()}`,
    order_amount: amount,
    order_currency: 'INR',
    customer_details: {
      customer_id: userId,
      customer_email: email,
      customer_phone: '9999999999'
    },
    order_meta: {
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`
    }
  }

  const response = await fetch(
    'https://sandbox.cashfree.com/pg/orders',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.NEXT_PUBLIC_CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY
      },
      body: JSON.stringify(orderData)
    }
  )

  const order = await response.json()
  return NextResponse.json(order)
}