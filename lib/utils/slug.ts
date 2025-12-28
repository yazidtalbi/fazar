export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  return new Promise(async (resolve) => {
    let slug = baseSlug;
    let counter = 2;

    while (await checkExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    resolve(slug);
  });
}

