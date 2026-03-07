'use client'

import { useState } from 'react'
import { Plus, Minus, Trash2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { OrderWithItems } from '@/types/app'

const PAYMENT_DETAILS = {
  name: 'Lana Moses-Gould',
  sortCode: '04-00-03',
  accountNumber: '24816775',
}

interface Adjustment {
  id: string
  label: string
  amount: string
  type: 'addon' | 'discount'
  discountType: 'fixed' | 'percent' // only relevant when type === 'discount'
}

interface InvoiceClientProps {
  order: OrderWithItems
  invoiceNumber: number
}

function fmt(n: number) {
  return `£${Math.abs(n).toFixed(2)}`
}

export function InvoiceClient({ order, invoiceNumber }: InvoiceClientProps) {
  const [itemPrices, setItemPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      order.order_items.map((item) => [
        item.id,
        item.menu_items.price != null ? String(item.menu_items.price) : '',
      ])
    )
  )
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [headerImages, setHeaderImages] = useState(['', '', ''])

  const invoiceDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })

  const itemsSubtotal = order.order_items.reduce((sum, item) => {
    const price = parseFloat(itemPrices[item.id] ?? '0') || 0
    return sum + price * item.quantity
  }, 0)

  // Step 1: apply fixed add-ons and fixed discounts
  const fixedAdjustmentsTotal = adjustments.reduce((sum, adj) => {
    if (adj.type === 'addon') return sum + (parseFloat(adj.amount) || 0)
    if (adj.discountType === 'fixed') return sum - (parseFloat(adj.amount) || 0)
    return sum
  }, 0)
  const subtotalAfterFixed = itemsSubtotal + fixedAdjustmentsTotal

  // Step 2: apply percentage discounts to the running total
  const totalPercentDiscount = Math.min(
    adjustments.reduce((sum, adj) => {
      if (adj.type === 'discount' && adj.discountType === 'percent') {
        return sum + (parseFloat(adj.amount) || 0)
      }
      return sum
    }, 0),
    100
  )
  const percentDiscountAmount = subtotalAfterFixed * (totalPercentDiscount / 100)

  const grandTotal = subtotalAfterFixed - percentDiscountAmount

  function addAdjustment(type: 'addon' | 'discount') {
    setAdjustments((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: '', amount: '', type, discountType: 'fixed' },
    ])
  }

  function updateAdjustment(id: string, field: keyof Adjustment, value: string) {
    setAdjustments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    )
  }

  function removeAdjustment(id: string) {
    setAdjustments((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="min-h-screen">
      {/* ── Configuration panel (hidden on print) ── */}
      <div className="no-print p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        <h2 className="text-white font-semibold text-lg">Configure Invoice</h2>

        {/* Header photos */}
        <div className="space-y-3">
          <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">Header Photos (optional)</p>
          <p className="text-white/30 text-xs">Paste a URL for each photo that appears in the invoice header.</p>
          {headerImages.map((url, i) => (
            <div key={i} className="flex items-center gap-3">
              <Label className="w-16 text-white text-sm shrink-0">Photo {i + 1}</Label>
              <Input
                placeholder="https://…"
                value={url}
                onChange={(e) =>
                  setHeaderImages((prev) => prev.map((u, j) => (j === i ? e.target.value : u)))
                }
                className="h-9 text-sm"
              />
            </div>
          ))}
        </div>

        {/* Item prices */}
        <div className="space-y-3">
          <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">Item Prices</p>
          {order.order_items.map((item) => {
            const inputId = `price-${item.id}`
            return (
              <div key={item.id} className="flex items-center gap-3">
                <Label htmlFor={inputId} className="flex-1 text-white text-sm">
                  {item.menu_items.name}
                  <span className="text-white/40 ml-1">(qty {item.quantity})</span>
                </Label>
                <div className="flex items-center gap-1 w-32">
                  <span className="text-white/60 text-sm" aria-hidden="true">£</span>
                  <Input
                    id={inputId}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={itemPrices[item.id] ?? ''}
                    onChange={(e) =>
                      setItemPrices((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Adjustments */}
        <div className="space-y-3">
          <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">Add-ons &amp; Discounts</p>
          {adjustments.map((adj) => {
            const isPercent = adj.type === 'discount' && adj.discountType === 'percent'
            return (
              <div key={adj.id} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                {/* Row 1 (mobile) / left side (desktop): badge + label + trash */}
                <div className="flex items-center gap-2 flex-1">
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                      adj.type === 'discount'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {adj.type === 'discount' ? '−' : '+'}
                  </span>
                  <Input
                    placeholder={
                      isPercent
                        ? 'Label (e.g. 10% Family Discount)'
                        : 'Label (e.g. Family Discount)'
                    }
                    value={adj.label}
                    onChange={(e) => updateAdjustment(adj.id, 'label', e.target.value)}
                    className="h-9 text-sm flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdjustment(adj.id)}
                    aria-label="Remove adjustment"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/30 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Row 2 (mobile) / right side (desktop): toggle + amount */}
                <div className="flex items-center gap-2 ml-7 sm:ml-0 shrink-0">
                  {adj.type === 'discount' && (
                    <div
                      role="group"
                      aria-label="Discount type"
                      className="flex rounded-md overflow-hidden border border-white/20"
                    >
                      <button
                        type="button"
                        aria-pressed={adj.discountType === 'fixed'}
                        aria-label="Fixed amount discount"
                        onClick={() => {
                          updateAdjustment(adj.id, 'discountType', 'fixed')
                          updateAdjustment(adj.id, 'amount', '')
                        }}
                        className={`px-3 h-9 text-sm font-medium transition-colors ${
                          adj.discountType === 'fixed'
                            ? 'bg-brand-gold text-brand-bg'
                            : 'bg-transparent text-white/50 hover:text-white'
                        }`}
                      >
                        £
                      </button>
                      <button
                        type="button"
                        aria-pressed={adj.discountType === 'percent'}
                        aria-label="Percentage discount"
                        onClick={() => {
                          updateAdjustment(adj.id, 'discountType', 'percent')
                          updateAdjustment(adj.id, 'amount', '')
                        }}
                        className={`px-3 h-9 text-sm font-medium transition-colors ${
                          adj.discountType === 'percent'
                            ? 'bg-brand-gold text-brand-bg'
                            : 'bg-transparent text-white/50 hover:text-white'
                        }`}
                      >
                        %
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-1 w-24">
                    <Input
                      type="number"
                      min="0"
                      step={isPercent ? '0.1' : '0.01'}
                      max={isPercent ? '100' : undefined}
                      placeholder={isPercent ? '0' : '0.00'}
                      value={adj.amount}
                      onChange={(e) => updateAdjustment(adj.id, 'amount', e.target.value)}
                      className="h-9 text-sm"
                    />
                    <span className="text-white/60 text-sm shrink-0" aria-hidden="true">
                      {isPercent ? '%' : '£'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => addAdjustment('addon')}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add-on
            </Button>
            <Button variant="outline" size="sm" onClick={() => addAdjustment('discount')}>
              <Minus className="w-3.5 h-3.5 mr-1" />
              Discount
            </Button>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 flex items-center justify-between">
          <p className="text-white/60 text-sm">
            Total:{' '}
            <span className={`font-semibold ${grandTotal < 0 ? 'text-red-400' : 'text-white'}`}>
              {grandTotal < 0 ? `−${fmt(grandTotal)}` : fmt(grandTotal)}
            </span>
          </p>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* ── Printable Invoice ── */}
      <div className="invoice-page">
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            .invoice-page, .invoice-page * { visibility: visible !important; }
            /* position:absolute lets the invoice flow across multiple pages;
               no padding override so the invoice keeps its own spacing */
            .invoice-page { position: absolute; top: 0; left: 0; width: 100%; }
            .no-print { display: none !important; }
          }

          .invoice-page {
            background-color: #7DB87A;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%237DB87A'/%3E%3Ccircle cx='1' cy='1' r='0.6' fill='%236aab67' opacity='0.4'/%3E%3Ccircle cx='3' cy='3' r='0.6' fill='%236aab67' opacity='0.4'/%3E%3C/svg%3E");
            /* Force browser to print backgrounds — overrides the "print background graphics" setting */
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            min-height: 100vh;
            padding: 40px 48px 56px;
            font-family: 'Playfair Display', Georgia, serif;
            color: #1e4a1a;
          }

          .invoice-title {
            font-family: 'Lilita One', cursive;
            font-size: 52px;
            color: #1e4a1a;
            text-align: center;
            line-height: 1.1;
            margin-bottom: 28px;
          }

          .invoice-images {
            display: flex;
            justify-content: center;
            gap: 32px;
            margin-bottom: 28px;
          }

          .invoice-img-circle {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            display: block;
          }

          .invoice-img-placeholder {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: rgba(30,74,26,0.18);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
          }

          .invoice-meta {
            display: flex;
            justify-content: space-between;
            font-style: italic;
            font-size: 17px;
            margin-bottom: 16px;
          }

          .invoice-customer {
            font-family: 'Playfair Display', serif;
            font-size: 44px;
            font-style: italic;
            margin-bottom: 24px;
            line-height: 1.1;
          }

          .invoice-table-header {
            display: grid;
            grid-template-columns: 1fr 80px 120px;
            font-family: 'Baloo 2', sans-serif;
            font-weight: 800;
            font-size: 20px;
            margin-bottom: 8px;
            padding-bottom: 4px;
          }

          .invoice-table-header .col-right { text-align: right; }

          .invoice-row {
            display: grid;
            grid-template-columns: 1fr 80px 120px;
            font-style: italic;
            font-size: 16px;
            padding: 6px 0;
          }

          .invoice-row .col-center { text-align: center; }
          .invoice-row .col-right  { text-align: right; }

          .invoice-adjustment {
            display: grid;
            grid-template-columns: 1fr 80px 120px;
            font-style: italic;
            font-size: 16px;
            padding: 6px 0;
          }

          .invoice-adjustment .col-right { text-align: right; }

          .invoice-divider {
            border: none;
            border-top: 1px solid rgba(30,74,26,0.3);
            margin: 12px 0;
          }

          .invoice-total {
            display: flex;
            justify-content: flex-end;
            font-family: 'Playfair Display', serif;
            font-size: 26px;
            font-style: italic;
            margin: 16px 0 32px;
          }

          .invoice-payment-heading {
            font-family: 'Baloo 2', sans-serif;
            font-weight: 800;
            font-size: 18px;
            margin-bottom: 12px;
          }

          .invoice-payment-details {
            font-family: 'Baloo 2', sans-serif;
            font-weight: 700;
            font-size: 20px;
            line-height: 1.6;
            margin-bottom: 40px;
          }

          .invoice-footer {
            text-align: center;
            font-style: italic;
            font-size: 22px;
            line-height: 1.4;
          }
        `}</style>

        <div className="invoice-title">LaLa&apos;s Bakes &amp; Cakes</div>

        {/* Header photos — always shown; placeholder circles when no URL provided */}
        <div className="invoice-images">
          {headerImages.map((url, i) =>
            url ? (
              <img key={i} src={url} alt="" className="invoice-img-circle" />
            ) : (
              <div key={i} className="invoice-img-placeholder">🎂</div>
            )
          )}
        </div>

        <div className="invoice-meta">
          <span>Invoice number: {invoiceNumber}</span>
          <span>Invoice date: {invoiceDate}</span>
        </div>

        <div className="invoice-customer">{order.customers.name}</div>

        <div className="invoice-table-header">
          <span>ITEM</span>
          <span>QTY</span>
          <span className="col-right">PRICE</span>
        </div>

        <hr className="invoice-divider" />

        {order.order_items.map((item) => {
          const price = parseFloat(itemPrices[item.id] ?? '0') || 0
          const lineTotal = price * item.quantity
          return (
            <div key={item.id} className="invoice-row">
              <span>{item.menu_items.name}</span>
              <span className="col-center">{item.quantity}</span>
              <span className="col-right">{fmt(lineTotal)}</span>
            </div>
          )
        })}

        {adjustments.map((adj) => {
          const amount = parseFloat(adj.amount) || 0
          if (!adj.label && !amount) return null
          const isPercentDiscount = adj.type === 'discount' && adj.discountType === 'percent'
          const displayAmount = isPercentDiscount
            ? subtotalAfterFixed * (amount / 100)
            : amount
          return (
            <div key={adj.id} className="invoice-adjustment">
              <span>
                {adj.label || (adj.type === 'discount' ? 'Discount' : 'Add-on')}
                {isPercentDiscount && amount ? ` (${amount}%)` : ''}
              </span>
              <span />
              <span className="col-right">
                {adj.type === 'discount' ? `-${fmt(displayAmount)}` : fmt(displayAmount)}
              </span>
            </div>
          )
        })}

        <hr className="invoice-divider" />

        <div className="invoice-total">Total: {fmt(grandTotal)}</div>

        <div className="invoice-payment-heading">Please make full payment to:</div>
        <div className="invoice-payment-details">
          {PAYMENT_DETAILS.name}<br />
          {PAYMENT_DETAILS.sortCode}<br />
          {PAYMENT_DETAILS.accountNumber}
        </div>

        <div className="invoice-footer">
          Thank you so much for buying from<br />
          LaLa&apos;s Bakes &amp; Cakes!
        </div>
      </div>
    </div>
  )
}
