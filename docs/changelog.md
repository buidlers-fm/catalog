last updated: july 5, 2024.

# big things for july - august 2024

key: 🛠️ in progress | ✅ done | ⌛️ upcoming

- ✅ Author profile pages including the author's bio and the books they've written.
- 🛠️ Expand the above to include profile pages for other book people, including editors and agents.
- 🛠️ Show a book's credits (who worked on the book) on the book page.
- ⌛️ Email notifications and settings to configure these.
- ⌛️ Timeline of your reading, where you can view and edit your reading history.

---

# changelog

A running journal of things we've been working on around catalog. 🛠️ 🚧

## june 10 - july 7, 2024

Main things:

- Any catalog user can edit a person's profile details.
- Any catalog user can edit a person's authored books.

Small fixes/improvements:

- Fixed book search on mobile, and on desktop Safari.
- Misc visual/styling tweaks.

## may 18 - june 9, 2024

Main things:

- New "people" pages (for now, just for book authors) include author's bio, photo, and books they've written, pulling information from OpenLibrary and Wikipedia whenever possible.
  - Each book's page links to its author's page.

Small fixes/improvements:

- Added a helpful tip to the guidelines for editing a book cover.
- (Internal) Upgraded our auth library for better sign-out handling.
- (Internal) Improved logging so we can have more visibility into how the app is running.

## april 15 - may 17, 2024

Main things:

- A new tour of the app to introduce you to some of the things you can do.
- Allow users to invite friends to join catalog.

Small fixes/improvements:

- Fixed various visual bugs including in book notes, the mobile nav bar, and the homepage sections.
- Fixed bug where on a book page, not all friends' activity was showing up.

## april 8-14, 2024

Main things:

- More privacy settings: You can now control who can see your shelves and your current status, and who can find you by searching for your name.

Small fixes/improvements:

- Added "three dots" extended menu to the book cover overlay, where you can add the book to lists or go to the book's page. More options will be added over time, and depending on demand.

## april 1-7, 2024

Main things:

- New user settings area where you can edit your profile, change your password, or update privacy settings.
- You can set the visibility of your book notes: public, signed-in users, users you follow, or only you.

Small fixes/improvements:

- Added public link to the "explore" page, in the header nav.

## march 25-31, 2024

Main things:

- You can now recommend a book to a friend (which can be any of your followers), from the book's page. Your rec will appear in the recipient's inbox, where they can add it to their to-read shelf if they want to.
  - As part of this change, the notifs page has also been moved into the inbox, alongside the new recs page.

Small fixes/improvements:

- Fixed: changes to some book covers not reflecting on the book page.
- Fixed: notifs not appearing for follows or for liking a current status.

## march 18-24, 2024

Main things:

- Revamped the (signed-in) homepage to include all the latest activity from your friends, including latest books shelved, latest statuses, and latest notes and lists your friends have created.

Small fixes/improvements:

- Fixed: notifs not getting created when liking a note/post.
- Added "copy link" button to book page for easy sharing.
- Added WorldCat link to book page so you can check nearby libraries for the book.
- Misc styling tweaks: explore page, user nav button.

## march 11-17, 2024

Main things:

- New [explore](https://catalog.fyi/explore) page featuring new books picked out by catalog staff. (Some elements that were on the home page have been moved to the explore page.)
- You can now save any list, comment, note, or post by clicking its bookmark icon, and you can view your saved items on their own page ("saved" in the user menu).

Small fixes/improvements:

- Improved handling for when OpenLibrary fails to respond.
- Fixed: notes/conversations on book page failing to update when you've posted a new one.
- Fixed 3 bugs involving notifications: some notifs failing to create; page crashing when trying to load a notif for a deleted item; don't notify yourself if you comment on your own item or mention yourself.
- Fixed: we now always redirect root (catalog.fyi) to home page (not landing page) if signed in.
- Fixed: z-index bug where book covers from the underlying page would sometimes incorrectly appear on top of the current modal.
- Fixed: display name not used in friends' shelf activity on the book page.
- Fixed: catalog news post page caching issue.
- Cleanup: delete related notifs and likes when an item (list, comment, note, etc) is deleted.
- Restored the link to the guide (now found in the feedback modal, which is now named "help" in the menu).
- Update list's "last updated" time when a book is added via "add book to lists".
- Book page description expands/collapses when text is long.
- Book page now has "latest by you" section to gather your own notes/posts.
- Misc copy changes to make empty states more helpful.
- Misc styling tweaks: edit book page, book's "more notes/conversations/lists" pages, and mobile footer.

## march 4-10, 2024

Main things:

- New "+" button in nav so you can add a book to your shelves/lists or post about it from any page.

Small fixes/improvements:

- Fixed bug when trying to edit a current status that currently has no text
- Changed how the profile page loads, to make it load faster and to reduce timeout errors on this page
- Fixed: book's lists page not showing all lists

## february 26 - march 3, 2024

Main things:

- Bluesky read-only integration enabled specifically for Middlemarch (#MiddlemarchMadness) and Moby Dick (#AMonthOfDick) feeds.
- Book cover overlay: like/unlike or shelve a book from almost anywhere you can see a book cover.

Small fixes/improvements:

- Fixed bug with "add book to lists"
- Fixed styling on catalog news page posts
- You can now unshelve a book completely (vs. just moving it to a different shelf)
- Fixed bug with tapping a book cover on mobile, for reals this time

## february 19-25, 2024

Small fixes/improvements:

- Attempted to fix bug where clicking "shelves" on book page sometimes opens the "add a note" modal
- Fixed: description shouldn't say "from OpenLibrary" if book has been edited
- Fixed: "originally in English" checkbox broken on edit book page
- Lock original title to be the same as title, if book is originally in English
- Better detection of whether book is originally in English
- Clearer messaging (new error page) when user gets "refresh token" error
- Fixed bug with user ("@") search that was introduced by the above
- Changed how book page loads, to try to reduce timeout errors on this page.
- Added Bluesky logo 🦋

## february 12-18, 2024

Main things:

- Users can add TV/movie adaptations to books

Small fixes/improvements:

- Internal improvements (to automated testing) which will allow us to reduce risk of introducing bugs as we develop
- More thorough automated site monitoring so we can know when important pages go down

## february 5-11, 2024

Small fixes/improvements:

- Search: fixed bug so that we _actually_ strip leading articles from search term
- Fixed bug where it would let you log an empty book edit even without changing any fields
- Updated copy on edit book form to be clearer
- Improved messaging around password reset and related errors
- Upgraded to Next.js 14+ to fix some issues caused by Next.js bugs
- Improved auth error handling (no more "white screen of death")
- Various other styling, copy, UX tweaks

## january 29 - february 4, 2024

Main things:

- Users can edit book details and covers
  - (Not done yet: ability to add a new book; syncing back to OpenLibrary)
- User profile shows the user's edit history
- Added a leaderboard of users who have edited the most books

Small fixes/improvements:

- @-mentions: Fixed bug when @-mentioning someone on mobile
- Search: Expand search to allow results from OpenLibrary that have an OCLC or LCCN code but no ISBN (previously all results required an ISBN)
- Search: Strip leading articles from search term for (hopefully) better search results
- Various styling tweaks

## january 22-28, 2024

Main things:

- Comments on comments
- Book posts can have text as well as a link URL, and thus become full discussion threads
- Spoilers toggle in book notes and posts - thanks [@brianmcgue](https://catalog.fyi/users/brianmcgue) for working on this!
- Added feedback form in the app

Small fixes/improvements:

- Waitlist dashboard for admins
- Show who liked something
- Show shelf counts, obsessed (top 4) counts, and friends' activity on book page

## january 15-21, 2024

Main things:

- Notifications for follows, likes, and comments
- Enable comments on notes and lists
- Enable @-mentions in most long-text fields
- Added "Forgot password" flow
- Created this changelog!

Small fixes/improvements:

- User can like a current status
- Update signed-in homepage
- Add waitlist link to sign-in form
- Hide raw error messages
- Add tooltip to read dates link in book note modal
- Update the guide with tips, and add a sticky sidebar

## january 8-14, 2024

Main things:

- Finished work on uploading covers to our database, so that we're less reliant on OpenLibrary for cover images
- Comments on book links
- Edit, delete, like, and unlike a comment
- Replaced avatar upload component with our own home-rolled one - thanks [@brianmcgue](https://catalog.fyi/users/brianmcgue) for working on this!
- Added ability to search users in the nav bar

Small fixes/improvements:

- Updated the guide
- Added Discord link in footer
- Newsletter opt-in on signup
- Signing up for the waitlist automatically subscribes you to the newsletter if you opted in
- Limit friends' current statuses to past 2 weeks
- Use dropdown nav for user shelves on small screens
- Try again to fix tapping a list book on mobile
- Prevent long URLs/words from overflowing the text's container
- Show whether a book note's creator loved the book
- Fixed newsletter subscribe which was briefly broken by our domain update
- Differentiate between read vs. unread announcements (envelope state at top right)
- Misc tiny bug fixes

## december 21 - january 7, 2024

Launched catalog.fyi and invited the first users!

## july 15 - december 20, 2023

Pre-launch: Built out the first version of catalog.
