import { defineType, defineField, defineArrayMember } from "sanity";

export const navigation = defineType({
  name: "navigation",
  title: "Menu",
  type: "document",
  fields: [
    defineField({
      name: "navItems",
      title: "Nav items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "labelEN", title: "Label (EN)", type: "string" }),
            defineField({ name: "labelAR", title: "Label (AR)", type: "string" }),
            defineField({ name: "labelES", title: "Label (ES)", type: "string" }),
            defineField({ name: "labelFR", title: "Label (FR)", type: "string" }),
            defineField({ name: "href", title: "Link", type: "string" }),
            defineField({ name: "hasChevron", title: "Show chevron", type: "boolean", initialValue: false }),
          ],
          preview: { select: { title: "labelEN", subtitle: "href" } },
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
