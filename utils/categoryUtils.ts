
import { Category } from '../types';

export interface CategoryGroup {
    name: string;
    subcategories: string[];
}

export const structureCategoriesForSelect = (categories: Category[]): { topLevel: Category[], grouped: CategoryGroup[] } => {
    const categoryMap = new Map<string, string[]>();
    const topLevel: Category[] = [];

    const parentCategories = new Set<string>();
    categories.forEach(c => {
        if (c.includes(':')) {
            parentCategories.add(c.split(':')[0]);
        }
    });

    categories.forEach(c => {
        if (c.includes(':')) {
            const [parent, child] = c.split(':', 2);
            if (!categoryMap.has(parent)) {
                categoryMap.set(parent, []);
            }
            categoryMap.get(parent)!.push(c);
        } else {
            if (!parentCategories.has(c)) {
                topLevel.push(c);
            }
        }
    });
    
    const grouped: CategoryGroup[] = Array.from(categoryMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, subcategories]) => ({
        name,
        subcategories: subcategories.sort((a,b) => a.localeCompare(b)),
    }));

    return { topLevel: topLevel.sort(), grouped };
};
