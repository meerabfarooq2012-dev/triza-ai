// Reset all payment/financial data to zero
import { db } from '../src/lib/db'

async function main() {
  console.log('🗑️  Clearing all payment data...')

  // Delete in dependency order
  const deletedOrderItems = await db.orderItem.deleteMany({})
  console.log(`  ✓ Deleted ${deletedOrderItems.count} order items`)

  const deletedTransactions = await db.transaction.deleteMany({})
  console.log(`  ✓ Deleted ${deletedTransactions.count} transactions`)

  const deletedPayments = await db.payment.deleteMany({})
  console.log(`  ✓ Deleted ${deletedPayments.count} payments`)

  const deletedWithdrawals = await db.withdrawal.deleteMany({})
  console.log(`  ✓ Deleted ${deletedWithdrawals.count} withdrawals`)

  const deletedDisputes = await db.dispute.deleteMany({})
  console.log(`  ✓ Deleted ${deletedDisputes.count} disputes`)

  const deletedOrders = await db.order.deleteMany({})
  console.log(`  ✓ Deleted ${deletedOrders.count} orders`)

  // Reset all wallet balances to 0
  const wallets = await db.wallet.findMany()
  for (const wallet of wallets) {
    await db.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: 0,
        pendingBalance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
      },
    })
  }
  console.log(`  ✓ Reset ${wallets.length} wallet balances to $0.00`)

  console.log('\n✅ All payment data cleared! Admin dashboard will show zeros.')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
