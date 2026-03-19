import { defineType, defineField, defineArrayMember } from "sanity";

export const navigation = defineType({
  name: "navigation",
  title: "Navigation",
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
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "href", title: "Link", type: "string" }),
            defineField({
              name: "submenuItems",
              title: "Submenu items",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  fields: [
                    defineField({ name: "label", title: "Label", type: "string" }),
                    defineField({ name: "href", title: "Link", type: "string" }),
                  ],
                  preview: { select: { title: "label", subtitle: "href" } },
                }),
              ],
            }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
    }),
    defineField({
      name: "contactLabel",
      title: "Contact button label",
      type: "string",
      initialValue: "Contact us",
    }),
    defineField({
      name: "contactHref",
      title: "Contact button link",
      type: "string",
      initialValue: "/",
    }),
  ],
  preview: { select: { title: "Navigation" } },
});
