import PersonBookRelationType from "enums/PersonBookRelationType"
import type Person from "types/Person"
import type PersonBookRelation from "types/PersonBookRelation"

function getPersonCredits(person: Person, { includeAuthorRelationType = true } = {}) {
  let creditsByRelationType = person.personBookRelations!.reduce(
    (acc, relation) => {
      const { relationType } = relation

      if (!includeAuthorRelationType && relationType === PersonBookRelationType.Author) return acc

      const existingRelationType = acc.find((r) => r.relationType === relationType)

      if (existingRelationType) {
        existingRelationType.relations.push(relation)
      } else {
        acc.push({
          relationType,
          relations: [relation],
        })
      }

      return acc
    },
    [] as { relationType: string; relations: PersonBookRelation[] }[],
  )

  // sort by relation type name, then by book first published year, descending
  creditsByRelationType = creditsByRelationType
    .sort((a, b) => a.relationType.localeCompare(b.relationType))
    .map((item) => ({
      ...item,
      relations: item.relations.sort((a, b) => {
        if (typeof a.book!.firstPublishedYear !== "number") return 1
        if (typeof b.book!.firstPublishedYear !== "number") return -1

        return b.book!.firstPublishedYear - a.book!.firstPublishedYear
      }),
    }))

  return creditsByRelationType
}

export { getPersonCredits }
