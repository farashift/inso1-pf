-- DropIndex
DROP INDEX "Payment_orderId_key";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "waiterName" TEXT;
