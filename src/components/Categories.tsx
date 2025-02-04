import Link from 'next/link';

const categories = [
  {
    name: 'Nouvelles applications',
    slug: 'new'
  },
  {
    name: 'En vedette',
    slug: 'featured'
  },
  {
    name: 'Notre sélection',
    slug: 'editors-choice'
  }
];

export default function Categories() {
  return (
    <div className="mt-12 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Catégories</h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow 
                     text-gray-700 hover:text-gray-900 text-sm whitespace-nowrap"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
