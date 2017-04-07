
if (db.getCollectionNames().indexOf("decisionDatabase") >= 0) {
  db["decisionDatabase"].drop();
}

db.createCollection("decisionDatabase", {
  validator: {
    $and: [
      { decision: { $exists: true } },
      { decision: { $type: "string" } },

      { regime: { $exists: true } },
      { regime: { $type: "string" } },

      // TODO: remove year since it comes from date
      { year: { $exists: true } },
      { year: { $type: "double" } },

      { date: { $exists: true } },
      { date: { $type: "date" } },

      { numParagraphs: { $exists: true } },
      { numParagraphs: { $type: "double" } },

      { decisionType: { $exists: true } },
      { decisionType: { $type: "string" } },
      { decisionType: { $in: ["extend", "implementation", "establish", "exemption", "intention", "terminate"] } },

      { measures: { $exists: true } },
      { measures:
        { $not:
          { $elemMatch:
            { $or: [
              { measureCategory: { $not: { $exists: true } } },
              { measureCategory: { $not: { $type: "string" } } },
              { measureType: { $not: { $exists: true } } },
              { measureType: { $not: { $type: "string" } } },
            ]}
          }
        }
      }
    ]
  },
  validationLevel: "strict",
  validationAction: "error",
})

