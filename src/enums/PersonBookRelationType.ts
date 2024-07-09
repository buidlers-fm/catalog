enum PersonBookRelationType {
  Agent = "agent",
  ArtDesign = "art_design",
  Audio = "audio",
  Author = "author",
  Contracts = "contracts",
  EarlyReader = "early_reader",
  Editor = "editor",
  FinanceAccounting = "finance_accounting",
  Management = "management",
  Marketing = "marketing",
  Operations = "operations",
  Production = "production",
  PublicityMedia = "publicity_media",
  Sales = "sales",
  SubsidiaryRights = "subsidiary_rights",
  Translator = "translator",
}

const personBookRelationTypeCopy = {
  [PersonBookRelationType.Agent]: "Agent",
  [PersonBookRelationType.ArtDesign]: "Art & Design",
  [PersonBookRelationType.Audio]: "Audio",
  [PersonBookRelationType.Author]: "Author",
  [PersonBookRelationType.Contracts]: "Contracts",
  [PersonBookRelationType.EarlyReader]: "Early Reader",
  [PersonBookRelationType.Editor]: "Editor",
  [PersonBookRelationType.FinanceAccounting]: "Finance & Accounting",
  [PersonBookRelationType.Management]: "Management",
  [PersonBookRelationType.Marketing]: "Marketing",
  [PersonBookRelationType.Operations]: "Operations",
  [PersonBookRelationType.Production]: "Production",
  [PersonBookRelationType.PublicityMedia]: "Publicity & Media",
  [PersonBookRelationType.Sales]: "Sales",
  [PersonBookRelationType.SubsidiaryRights]: "Subsidiary Rights",
  [PersonBookRelationType.Translator]: "Translator",
}

export default PersonBookRelationType
export { personBookRelationTypeCopy }
