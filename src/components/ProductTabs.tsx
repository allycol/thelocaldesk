'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/ProductGrid';
import {
  CATEGORY_LABELS,
  productsByCategory,
  type Product,
  type ProductCategory,
} from '@/lib/products';

const DEFAULT_CATEGORY: ProductCategory = 'flexible';

export function ProductTabs({ products, categories }: { products: Product[]; categories: ProductCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requested = searchParams.get('category');
  const activeCategory =
    categories.find((c) => c === requested) ?? (categories.includes(DEFAULT_CATEGORY) ? DEFAULT_CATEGORY : categories[0]);

  function selectCategory(category: ProductCategory) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const items = productsByCategory(products, activeCategory);

  return (
    <>
      <nav className="category-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-tab ${category === activeCategory ? 'is-active' : ''}`}
            onClick={() => selectCategory(category)}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </nav>

      {items.length === 0 ? <p className="empty-category">No products in this category yet.</p> : <ProductGrid items={items} />}
    </>
  );
}
