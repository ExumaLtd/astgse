import type { StructureResolver } from "sanity/structure";

const CATEGORIES = [
  "ACU / ASU / GPU",
  "Aircraft Heaters",
  "Ambulift",
  "Baggage Tractors",
  "Bagged Carts",
  "Belt Loaders",
  "Buses",
  "Cars",
  "Catering Trucks",
  "Chocks",
  "Container Transport",
  "Crash Tenders",
  "Deck Loaders / Cargo",
  "Deicing Units",
  "Dollies",
  "Forklifts",
  "Fuel Tankers",
  "Ground Support Equipment",
  "Loaders / Transporters",
  "Lorries",
  "Miscellaneous",
  "Other GSE",
  "Passenger Access",
  "PRM Units & Equipment",
  "Push Back Tractors",
  "Sweepers & Vacuum Tankers",
  "Toilet Units",
  "Towbar",
  "Tugs",
  "X-ray and Screening",
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem().title("Homepage").child(
        S.document().schemaType("homepage").documentId("homepage")
      ),
      S.listItem().title("Services").child(
        S.documentTypeList("servicePage").title("Services")
      ),
      S.listItem()
        .title("Equipment")
        .child(
          S.list()
            .title("Equipment")
            .items([
              S.listItem()
                .title("All Equipment")
                .child(S.documentTypeList("listing").title("All Equipment")),
              S.divider(),
              ...CATEGORIES.map((category) =>
                S.listItem()
                  .title(category)
                  .child(
                    S.documentList()
                      .title(category)
                      .filter('_type == "listing" && category == $category')
                      .params({ category })
                  )
              ),
            ])
        ),
      S.listItem().title("About").child(
        S.document().schemaType("about").documentId("about")
      ),
      S.listItem().title("Newsroom").child(
        S.documentTypeList("post").title("Newsroom")
      ),
      S.listItem().title("Menu").child(
        S.document().schemaType("navigation").documentId("navigation")
      ),
      S.divider(),
      S.listItem().title("Website enquiries").child(
        S.documentTypeList("contactSubmission").title("Website enquiries")
      ),
      S.listItem().title("Contacts").child(
        S.list().title("Contacts").items([
          S.listItem().title("All contacts").child(
            S.documentTypeList("contact").title("All contacts")
              .defaultOrdering([{ field: "lastSeenAt", direction: "desc" }])
          ),
          S.listItem().title("Multiple enquiries").child(
            S.documentList().title("Multiple enquiries")
              .filter('_type == "contact" && enquiryCount > 1')
              .defaultOrdering([{ field: "enquiryCount", direction: "desc" }])
          ),
          S.listItem().title("New this month").child(
            S.documentList().title("New this month")
              .filter('_type == "contact" && firstSeenAt > $from')
              .params({ from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString() })
              .defaultOrdering([{ field: "firstSeenAt", direction: "desc" }])
          ),
          S.divider(),
          S.listItem().title("By source").child(
            S.list().title("By source").items([
              S.listItem().title("Google").child(
                S.documentList().title("Google").filter('_type == "contact" && referrer match "google*"')
                  .defaultOrdering([{ field: "lastSeenAt", direction: "desc" }])
              ),
              S.listItem().title("LinkedIn").child(
                S.documentList().title("LinkedIn").filter('_type == "contact" && referrer match "linkedin*"')
                  .defaultOrdering([{ field: "lastSeenAt", direction: "desc" }])
              ),
              S.listItem().title("Direct").child(
                S.documentList().title("Direct").filter('_type == "contact" && referrer == "direct"')
                  .defaultOrdering([{ field: "lastSeenAt", direction: "desc" }])
              ),
              S.listItem().title("Other").child(
                S.documentList().title("Other").filter('_type == "contact" && defined(referrer) && referrer != "direct" && !(referrer match "google*") && !(referrer match "linkedin*")')
                  .defaultOrdering([{ field: "lastSeenAt", direction: "desc" }])
              ),
            ])
          ),
        ])
      ),
    ]);
