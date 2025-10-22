-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "category" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "recomendedProduct" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "similarProduct" JSONB[] DEFAULT ARRAY[]::JSONB[];
