import { defineType, defineField } from "sanity";

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  __experimental_actions: ["update", "publish"],
  fields: [
    defineField({
      name: "heroHeading",
      title: "Hero heading",
      type: "text",
      rows: 3,
      description: 'e.g. "Every aircraft. Every airport. Every day."',
    }),
    defineField({
      name: "heroSubtext",
      title: "Hero subtext",
      type: "text",
      rows: 3,
      description: "The small uppercase text at the bottom of the hero.",
    }),
    defineField({
      name: "backgroundImage",
      title: "Background image",
      type: "image",
      options: { hotspot: true },
      description: "Upload an image to replace the background video.",
    }),
  ],
  preview: { select: { title: "heroHeading" } },
});
