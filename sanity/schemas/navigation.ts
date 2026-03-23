import { defineType, defineField, defineArrayMember } from "sanity";

const childItem = defineArrayMember({
  type: "object",
  name: "childItem",
  fields: [
    defineField({ name: "labelEN", title: "Label (EN)", type: "string" }),
    defineField({ name: "labelAR", title: "Label (AR)", type: "string" }),
    defineField({ name: "labelES", title: "Label (ES)", type: "string" }),
    defineField({ name: "labelFR", title: "Label (FR)", type: "string" }),
    defineField({ name: "href", title: "Link", type: "string" }),
  ],
  preview: { select: { title: "labelEN", subtitle: "href" } },
});

export const navigation = defineType({
  name: "navigation",
  title: "Menu",
  type: "document",
  fields: [
    defineField({
      name: "navItems",
      title: "Nav items",
      description: "Drag to reorder. Add sub-items to create a dropdown.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "navItem",
          fields: [
            defineField({ name: "labelEN", title: "Label (EN)", type: "string" }),
            defineField({ name: "labelAR", title: "Label (AR)", type: "string" }),
            defineField({ name: "labelES", title: "Label (ES)", type: "string" }),
            defineField({ name: "labelFR", title: "Label (FR)", type: "string" }),
            defineField({ name: "href", title: "Link (leave blank if this is a dropdown parent)", type: "string" }),
            defineField({
              name: "children",
              title: "Sub-items",
              description: "Add sub-items to show a dropdown. Drag to reorder.",
              type: "array",
              of: [childItem],
            }),
          ],
          preview: {
            select: { title: "labelEN", subtitle: "href", children: "children" },
            prepare({ title, href, children }) {
              const count = Array.isArray(children) ? children.length : 0;
              return {
                title: title || "Untitled",
                subtitle: count > 0 ? `${count} sub-item${count !== 1 ? "s" : ""}` : (href || "No link"),
              };
            },
          },
        }),
      ],
    }),
    defineField({ name: "contactLabelEN", title: "Contact button (EN)", type: "string", initialValue: "Contact us" }),
    defineField({ name: "contactLabelAR", title: "Contact button (AR)", type: "string", initialValue: "اتصل بنا" }),
    defineField({ name: "contactLabelES", title: "Contact button (ES)", type: "string", initialValue: "Contáctenos" }),
    defineField({ name: "contactLabelFR", title: "Contact button (FR)", type: "string", initialValue: "Nous contacter" }),
    defineField({ name: "contactHref", title: "Contact button link", type: "string", initialValue: "/contact" }),
  ],
  preview: { select: {}, prepare: () => ({ title: "ASTGSE menu" }) },
});
