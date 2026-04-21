export const homePageContent = {
  title: "ATtune",
  searchBarPlaceholder: "Search artists, albums...",
  profile: "Profile",
  explore: "Explore",
  record: "Record",
  account: "Account",
  settings: "Settings",
  signOut: "Sign Out",
  filterSectionsText: "Filter Sections",
  recommendedAlbumsHeading: "Recommended Albums",
  recommendedArtistsHeading: "Recommended Artists",
  currentTopArtistsHeading: "Current Top Artists",
};

export const homePageLocators = {
  recommendedAlbumsListItems: 'section:has-text("Recommended Albums") ul > li',
  recommendedArtistsListItems:
    'section:has-text("Recommended Artists") ul > li',
  currentTopArtistsListItems: 'section:has-text("Current Top Artists") ul > li',
};
