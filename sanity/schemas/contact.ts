import { defineType, defineField } from "sanity";

export const contact = defineType({
  name: "contact",
  title: "Contacts",
  type: "document",
  orderings: [
    { title: "Last enquiry (newest)", name: "lastSeenDesc", by: [{ field: "lastSeenAt", direction: "desc" }] },
    { title: "First enquiry (newest)", name: "firstSeenDesc", by: [{ field: "firstSeenAt", direction: "desc" }] },
    { title: "Most enquiries", name: "enquiryCountDesc", by: [{ field: "enquiryCount", direction: "desc" }] },
    { title: "Name (A–Z)", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
  fields: [
    defineField({ name: "name",    title: "Name",    type: "string" }),
    defineField({ name: "email",   title: "Email",   type: "string" }),
    defineField({ name: "phone",   title: "Phone",   type: "string" }),
    defineField({ name: "company", title: "Company", type: "string" }),
    defineField({ name: "country",   title: "Country",   type: "string", readOnly: true }),
    defineField({ name: "continent", title: "Continent", type: "string", readOnly: true }),
    defineField({ name: "referrer",  title: "Source",    type: "string", readOnly: true }),
    defineField({
      name: "firstSeenAt",
      title: "First enquiry",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "lastSeenAt",
      title: "Last enquiry",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "enquiryCount",
      title: "Total enquiries",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "subscribedToMailingList",
      title: "Subscribed to mailing list",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "doNotContact",
      title: "Do not contact",
      description: "GDPR opt-out — do not include in any marketing communications.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { name: "name", email: "email", company: "company", count: "enquiryCount" },
    prepare({ name, email, company, count }) {
      return {
        title: name || email || "Unknown",
        subtitle: [company, email, count > 1 ? `${count} enquiries` : null].filter(Boolean).join(" · "),
      };
    },
  },
});
