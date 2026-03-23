import { defineType, defineField } from "sanity";

export const contactSubmission = defineType({
  name: "contactSubmission",
  title: "Contact Submissions",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "string",
    }),
    defineField({
      name: "message",
      title: "Message (English)",
      type: "text",
      description: "Auto-translated to English if submitted in another language.",
    }),
    defineField({
      name: "submittedLang",
      title: "Submitted Language",
      type: "string",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "City and country derived from IP address at time of submission.",
      readOnly: true,
    }),
    defineField({
      name: "timezone",
      title: "Timezone",
      type: "string",
    }),
    defineField({
      name: "localTime",
      title: "Local Time",
      type: "string",
      description: "Submission time in the user's local timezone.",
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At (GMT)",
      type: "datetime",
    }),
    defineField({
      name: "consentGivenAt",
      title: "Consent Given At",
      type: "datetime",
      description: "Timestamp when the user ticked the consent checkbox.",
    }),
    defineField({
      name: "consentText",
      title: "Consent Text (at time of submission)",
      type: "string",
      description: "Exact wording the user agreed to — for GDPR audit purposes.",
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "In Progress", value: "in_progress" },
          { title: "Responded", value: "responded" },
          { title: "Closed", value: "closed" },
        ],
        layout: "radio",
      },
      initialValue: "new",
    }),
    defineField({
      name: "notes",
      title: "Internal Notes",
      type: "text",
      description: "Private notes — not visible to the enquirer.",
    }),
  ],
  preview: {
    select: {
      name: "name",
      email: "email",
      status: "status",
      submittedAt: "submittedAt",
    },
    prepare({ name, email, status, submittedAt }) {
      const date = submittedAt
        ? new Date(submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "Unknown date";
      return {
        title: name || "Unknown",
        subtitle: `${email} · ${status?.toUpperCase() ?? "NEW"} · ${date}`,
      };
    },
  },
});
