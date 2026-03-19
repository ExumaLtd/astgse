import { defineType, defineField } from "sanity";

export const listing = defineType({
  name: "listing",
  title: "GSE Listings",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["For Sale", "For Hire", "Sold"], layout: "radio" },
      initialValue: "For Sale",
    }),
    defineField({ name: "make", title: "Make / Manufacturer", type: "string" }),
    defineField({ name: "model", title: "Model", type: "string" }),
    defineField({ name: "year", title: "Year", type: "number" }),
    defineField({ name: "hours", title: "Hours", type: "number" }),
    defineField({
      name: "condition",
      title: "Condition",
      type: "string",
      options: { list: ["New", "Used – Excellent", "Used – Good", "Used – Fair"], layout: "radio" },
    }),
    defineField({ name: "price", title: "Price (£)", type: "number" }),
    defineField({ name: "priceOnApplication", title: "Price on Application", type: "boolean", initialValue: false }),
    defineField({ name: "description", title: "Description", type: "text", rows: 5 }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          "Ground Power Units",
          "Aircraft Tugs",
          "Baggage Tractors",
          "Belt Loaders",
          "Catering Vehicles",
          "Fuel Equipment",
          "De-icing Equipment",
          "Air Starts",
          "Other",
        ],
      },
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "serialNumber", title: "Serial Number", type: "string" }),
    defineField({ name: "featured", title: "Featured Listing", type: "boolean", initialValue: false }),
  ],
  orderings: [
    { title: "Newest First", name: "createdAtDesc", by: [{ field: "_createdAt", direction: "desc" }] },
    { title: "Price Low–High", name: "priceAsc", by: [{ field: "price", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "status", media: "images.0" },
  },
});
