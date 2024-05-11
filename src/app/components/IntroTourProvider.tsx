"use client"

import { TourProvider } from "@reactour/tour"
import { setLocalStorage } from "lib/localstorage"

const INTRO_TOUR_LOCALSTORAGE_KEY = "catalog__intro-tour-step-index"
const INTRO_TOUR_PROFILE_PAGE_STEP = 0
const INTRO_TOUR_BOOK_PAGE_STEP = 4

const steps = [
  {
    selector: `[data-intro-tour="profile-page"]`,
    content: () => (
      <div>
        <h2 className="mb-2 font-bold">Profile page</h2>
        <p className="mb-2">
          We're now on your profile page. You can click "edit profile" to fill out your display
          name, profile photo, and anything else you want to add.
        </p>
        <p className="mb-2">
          To get back here, open the main menu by clicking your username at the top right, then
          click "profile".
        </p>
      </div>
    ),
  },
  {
    selector: `[data-intro-tour="catalog-home"]`,
    content: () => (
      <div>
        <h2 className="mb-2 font-bold">catalog logo</h2>
        While signed in, click on the catalog logo anytime to go to your "home" area where you can
        see the latest updates from your friends.
      </div>
    ),
  },
  {
    selector: `[data-intro-tour="create-list"]`,
    content: () => (
      <div>
        <h2 className="mb-2 font-bold">Profile page: create a list</h2>
        <p className="mb-2">
          If you have in mind a list of books you want to compile (for example books that share a
          common theme), create it by clicking "create a list" from your profile page.
        </p>
        <p className="mb-2">
          Note: You don't need to create a list for statuses like "to read", "currently reading",
          etc. In the next steps I'll show you how to handle those.
        </p>
      </div>
    ),
  },
  {
    selector: `[data-intro-tour="nav-bar"]`,
    content: () => (
      <div>
        <h2 className="mb-2 font-bold">Nav bar: search</h2>
        <p className="mb-2">
          From the nav bar, you can search for a book by title and author to go to that book's page,
          or search for a user by typing "@" followed by their username.
        </p>
        <p>Let's go to the page for "The Library Book"; I'll take you there now.</p>
      </div>
    ),
  },
  {
    selector: `[data-intro-tour="book-shelves"]`,
    content: () => (
      <div>
        <h2 className="mb-2 font-bold">Book page: shelves</h2>
        Click here to add the book to one of your shelves, e.g. "to read", "currently reading", and
        more. Everyone has the same 5 types of shelves, representing each book's status in your
        reading life.
      </div>
    ),
  },
  {
    selector: `[data-intro-tour="create-note"]`,
    content: () => (
      <div>
        <h2 className="mb-2 font-bold">Book page: note/log</h2>
        You can also "log" a book (record that you read it or are reading it, and optionally add
        start/finish dates), or write a note about it, which can be your review, or your thoughts or
        quotes as you read.
      </div>
    ),
  },
  {
    selector: `[data-intro-tour="create-thread"]`,
    content: () => (
      <div>
        <h2 className="mb-2 font-bold">Book page: create a thread</h2>
        If you want to share a link related to the book, or start a public discussion about it,
        create a thread in the conversations area.
      </div>
    ),
  },
  {
    selector: `[data-intro-tour="nav-bar"]`,
    content: () => (
      <div>
        <h2 className="mb-2 font-bold">Nav bar: "+" button</h2>
        Just a couple more things! Use the "+" button as a shortcut to find a book and bring up a
        menu of the most common actions you can do with it.
      </div>
    ),
  },
  {
    selector: `[data-intro-tour="nav-bar"]`,
    content: () => (
      <div>
        <h2 className="mb-2 font-bold">Nav bar: main menu</h2>
        <p className="mb-2">
          Finally, the menu you can open by clicking on your username is your portal to all of your
          stuff around catalog, and includes links to your shelves, your settings (where you can
          make some of your stuff private), and to the "explore" page to see what others are up to.
          Feel free to check out the "explore" page now!
        </p>
        <p>
          This concludes our tour. You can take the tour again anytime by going to the main menu and
          clicking "help". See you around!
        </p>
      </div>
    ),
  },
]

const prevButton = ({ Button, currentStep }) => <Button kind="prev" hideArrow={currentStep === 0} />
const nextButton = ({ Button, currentStep, stepsLength, setIsOpen }) => {
  const last = currentStep === stepsLength - 1
  const stepBeforeBookPath = 3
  const bookPath = "/books/the-library-book-susan-orlean"

  if (last) {
    return (
      <button
        onClick={() => {
          setIsOpen(false)
        }}
      >
        done
      </button>
    )
  }

  if (currentStep === stepBeforeBookPath) {
    return (
      <Button
        hideArrow
        onClick={() => {
          setIsOpen(false)
          setLocalStorage(INTRO_TOUR_LOCALSTORAGE_KEY, stepBeforeBookPath + 1)
          window.location.href = bookPath
        }}
      >
        go
      </Button>
    )
  }

  return <Button />
}
export default function IntroTourProvider({ children }) {
  return (
    <TourProvider
      disableInteraction // this prevents opening modals when clicking on the highlighted area
      onClickMask={() => {}} // don't close tour when mask is clicked
      beforeClose={() => {}}
      steps={steps}
      showBadge
      badgeContent={({ currentStep }) => `${currentStep + 1}/${steps.length}`}
      showDots={false}
      showNavigation={steps.length > 1}
      prevButton={prevButton}
      nextButton={nextButton}
      styles={{
        popover: (base) => ({
          ...base,
          backgroundColor: "hsl(45, 8%, 22%)", // cat-gray-900
          "--reactour-accent": "hsl(45, 100%, 55%)", // cat-gold-500
          borderRadius: "4px", // rounded
          fontFamily: "var(--font-mulish)",
          marginLeft: "16px",
          padding: "48px 32px",
        }),
        maskArea: (base) => ({ ...base }),
        maskWrapper: (base) => ({ ...base }),
        badge: (base) => ({
          ...base,
          left: "16px",
          right: "auto",
          top: "auto",
          bottom: "-8px",
          color: "hsl(45, 4%, 12%)",
        }),
        controls: (base) => ({ ...base, marginTop: "32px" }),
        arrow: (base) => ({
          ...base,
          color: "hsl(45, 4%, 92%)", // cat-white
        }),
        close: (base) => ({ ...base, left: "auto", right: 24, top: 24 }),
      }}
    >
      {children}
    </TourProvider>
  )
}

export { INTRO_TOUR_LOCALSTORAGE_KEY, INTRO_TOUR_PROFILE_PAGE_STEP, INTRO_TOUR_BOOK_PAGE_STEP }
