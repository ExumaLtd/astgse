import { defineType, defineField } from "sanity";

export const servicePage = defineType({
  name: "servicePage",
  title: "Services",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Page Title", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "heroHeading", title: "Hero Heading", type: "text", rows: 3 }),
    defineField({ name: "heroBody", title: "Hero Body Text", type: "text", rows: 4 }),
    defineField({ name: "sectionHeading", title: "Section Heading", type: "string" }),
    defineField({ name: "sectionBody", title: "Section Body Text", type: "text", rows: 4 }),
    defineField({ name: "heroImage", title: "Hero Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "sectionImage", title: "Section Image", type: "image", options: { hotspot: true } }),
  ],
});
